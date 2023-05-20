import { NextRequest, NextResponse } from "next/server";
import {
  ErrorResponse,
  TPath,
  ValidatePathResponse,
} from "types/googleapis";
import { ExtendedError } from "utils/driveHelper";
import apiConfig from "config/api.config";
import driveClient from "utils/driveClient";
import {
  shortDecrypt,
  shortEncrypt,
} from "utils/encryptionHelper";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const _start = Date.now();
  try {
    const path = new URL(request.url).searchParams.get(
      "path",
    );
    if (!path) {
      throw new ExtendedError(
        "No path provided",
        400,
        "badRequest",
      );
    }

    let pathArray: string[] = path.split(/[\\/]/);
    pathArray = pathArray.filter((path) => path !== "");

    const getRootId =
      apiConfig.files.rootFolder !== "root"
        ? apiConfig.files.rootFolder
        : driveClient.files
            .get({
              fileId: "root",
              fields: "id",
            })
            .then((res) => res.data.id);
    const getPathId = pathArray.map(async (path, index) => {
      const query = [
        "trashed = false",
        "'me' in owners",
        `name = '${path}'`,
      ];
      const fetchFolderContents =
        await driveClient.files.list({
          q: `${query.join(" and ")}`,
          fields: "files(id, name, mimeType, parents)",
        });

      if (!fetchFolderContents.data.files?.length) {
        throw new ExtendedError(
          `Path ${path} is not found`,
          404,
          "notFound",
        );
      }

      return {
        path,
        data: fetchFolderContents.data.files.map(
          (file) => ({
            id: file.id,
            parents: file.parents?.[0],
            mimeType: file.mimeType,
          }),
        ),
      };
    });

    const [rootId, pathId] = await Promise.all([
      getRootId,
      Promise.all(getPathId),
    ]);

    const selectedPath: string[] = [];
    const mapIds: TPath[] = [];

    // Check path validity
    pathId.forEach((path, index) => {
      if (index === 0) {
        // Check if root folder inside data id
        const checkRoot = path.data.find(
          (item) => item.parents === rootId,
        );
        if (!checkRoot) {
          throw new ExtendedError(
            `Path "${path.path}" is either not found or not valid`,
            400,
            "badRequest",
          );
        }

        selectedPath.push(checkRoot.id as string);
        mapIds.push({
          name: path.path,
          id: shortEncrypt(checkRoot.id as string),
          mimeType: checkRoot.mimeType as string,
        });
      } else {
        const checkPath = path.data.find(
          (item) =>
            item.parents === selectedPath[index - 1],
        );
        if (!checkPath) {
          throw new ExtendedError(
            `Path "${path.path}" is either not found or not valid`,
            400,
            "badRequest",
          );
        }

        selectedPath.push(checkPath.id as string);
        mapIds.push({
          name: path.path,
          id: shortEncrypt(checkPath.id as string),
          mimeType: checkPath.mimeType as string,
        });
      }
    });

    // Check for protected folder
    const getPassword = mapIds.map(async (path) => {
      if (
        path.mimeType !==
        "application/vnd.google-apps.folder"
      )
        return;

      const query = [
        "trashed = false",
        "'me' in owners",
        `'${shortDecrypt(path.id)}' in parents`,
        `name = '${apiConfig.files.specialFile.password}'`,
      ];

      const folderContents = await driveClient.files.list({
        q: `${query.join(" and ")}`,
        fields: "files(id, name, mimeType, parents)",
      });

      if (!folderContents.data.files?.length) return;

      return {
        path: path.name,
        password: folderContents.data.files?.[0].id,
      };
    });

    let password = await Promise.all(getPassword);
    password = password.filter(
      (item) => item !== undefined,
    );
    const lastProtectedFolder =
      password[password.length - 1];

    // Check password
    if (lastProtectedFolder?.password) {
      const fetchPassword = await driveClient.files.get(
        {
          fileId: lastProtectedFolder.password,
          alt: "media",
        },
        { responseType: "text" },
      );

      const userPassword = cookies().get(
        `next-gdrive-password/${encodeURIComponent(
          lastProtectedFolder.path,
        )}`,
      )?.value;
      console.log(
        `next-gdrive-password/${encodeURIComponent(
          lastProtectedFolder.path,
        )}`,
        shortEncrypt("loremipsum"),
      );
      if (!userPassword) {
        throw new ExtendedError(
          `You are not authorized to access this folder`,
          401,
          "unauthorized",
        );
      }
      console.log(
        shortDecrypt(userPassword),
        fetchPassword.data,
      );
      if (
        shortDecrypt(userPassword) !== fetchPassword.data
      ) {
        throw new ExtendedError(
          `The password you entered is incorrect`,
          401,
          "unauthorized",
        );
      }
    }

    const payload: ValidatePathResponse = {
      success: true,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      data: mapIds,
      password: lastProtectedFolder?.password
        ? shortEncrypt(lastProtectedFolder.password)
        : undefined,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": apiConfig.cache,
      },
    });
  } catch (error: any) {
    const payload: ErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - _start,
      code: error.code || 500,
      errors: {
        message:
          error.errors?.[0].message ||
          error.message ||
          "Unknown error",
        reason:
          error.errors?.[0].reason ||
          error.cause ||
          "internalError",
      },
    };

    return NextResponse.json(payload, {
      status: payload.code || 500,
    });
  }
}
