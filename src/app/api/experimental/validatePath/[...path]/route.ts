import gIndexConfig from "config";
import { NextRequest, NextResponse } from "next/server";

import {
  decryptData,
  encryptData,
} from "utils/encryptionHelper/hash";
import ExtendedError from "utils/extendedError";
import gdrive from "utils/gdriveInstance";
import { checkPathPassword } from "utils/passwordHelper";

import {
  APIValidateResponse,
  ErrorResponse,
} from "types/api/response";
import { Constant } from "types/constant";

type FilePath = {
  name: string;
  encryptedId: string;
  mimeType: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const reqStart = Date.now();
  const pathArray = params.path;

  try {
    const fetchRootId = gdrive.files.get({
      fileId: gIndexConfig.apiConfig.rootFolder,
      fields: "id",
    });
    const fetchPathId = pathArray.map(async (path) => {
      const query = ["trashed = false", `name = '${path}'`];
      const fetchFolderContents = await gdrive.files.list({
        q: `${query.join(" and ")}`,
        fields: "files(id, name, mimeType, parents)",
      });

      if (!fetchFolderContents.data.files?.length) {
        throw new Error(`Path "${path}" is not found`);
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
      fetchRootId,
      Promise.all(fetchPathId),
    ]);

    const selectedPath: string[] = [];
    const mappedPath: FilePath[] = [];

    // Check path validity
    pathId.forEach((path, index) => {
      let checkPath =
        index === 0
          ? path.data.find(
              (file) => file.parents === rootId.data.id,
            )
          : path.data.find(
              (file) =>
                file.parents === selectedPath[index - 1],
            );
      if (!checkPath)
        throw new ExtendedError(
          "Path not found",
          404,
          `Can't find path "${path.path}". Please check your path again.`,
        );
      selectedPath.push(checkPath.id as string);
      mappedPath.push({
        name: path.path,
        encryptedId: encryptData(checkPath.id as string),
        mimeType: checkPath.mimeType as string,
      });
    });

    return NextResponse.json(mappedPath, {
      status: 200,
    });

    // Check for protected folder
    const fetchProtectedFolder = mappedPath.map(
      async (path) => {
        if (
          path.mimeType !==
          "application/vnd.google-apps.folder"
        )
          return;

        const query = [
          "trashed = false",
          `'${decryptData(path.encryptedId)}' in parents`,
          `name = '${gIndexConfig.apiConfig.specialFile.password}'`,
        ];

        const fetchFolderContents = await gdrive.files.list(
          {
            q: `${query.join(" and ")}`,
            fields: "files(id, name, mimeType, parents)",
          },
        );
        if (!fetchFolderContents.data.files?.length) return;

        return {
          path: path.name,
          passwordId: fetchFolderContents.data.files[0].id,
        };
      },
    );
    let protectedFolder = await Promise.all(
      fetchProtectedFolder,
    );
    console.log(protectedFolder);
    protectedFolder = protectedFolder.filter(
      (item) => item !== undefined,
    );
    const nearestFolderPassword =
      protectedFolder[protectedFolder.length - 1] ?? null;

    console.log(
      "After nearestFolderPassword",
      nearestFolderPassword,
    );

    if (
      nearestFolderPassword &&
      nearestFolderPassword.passwordId
    ) {
      const fetchPassword = await gdrive.files.get(
        {
          fileId: nearestFolderPassword.passwordId,
          alt: "media",
        },
        {
          responseType: "text",
        },
      );

      const userPassword =
        request.cookies.get(Constant.cookies_SitePassword)
          ?.value ?? null;
      if (!userPassword) {
        throw new ExtendedError(
          "Password required",
          401,
          `You need to enter password to access this file / folder`,
        );
      }

      const nearestPathIndex = mappedPath.findIndex(
        (path) => path.name === nearestFolderPassword.path,
      );
      const currentPath =
        "/" +
        mappedPath
          .slice(0, nearestPathIndex + 1)
          .map((path) => path.name)
          .join("/");

      const validPassword = checkPathPassword(
        currentPath,
        userPassword,
        fetchPassword.data as string,
      );
      if (!validPassword) {
        throw new ExtendedError(
          "Invalid password",
          401,
          `The password you entered is invalid`,
        );
      }
    }

    const payload: APIValidateResponse = {
      timestamp: Date.now(),
      responseTime: Date.now() - reqStart,
      path: mappedPath.map((path) => path.name).join("/"),
      valid: true,
    };

    return NextResponse.json(payload, {
      status: 200,
    });
  } catch (error: any) {
    const res: ErrorResponse = {
      timestamp: Date.now(),
      responseTime: Date.now() - reqStart,
      error: {
        code: error.code || 500,
        message: error.message,
        reason: error.errors?.[0].reason,
      },
    };
    return NextResponse.json(res, {
      status: error.code || 500,
    });
  }
}
