import { NextRequest, NextResponse } from "next/server";
import createErrorPayload from "utils/apiHelper/createErrorPayload";
import { RequestContext } from "types/general";
import apiConfig from "config/api.config";
import gdrive from "utils/apiHelper/gdrive";
import ExtendedError from "utils/generalHelper/extendedError";
import { Constant } from "types/general/constant";
import {
  FilePath,
  ValidateFilePathResponse,
} from "types/api/path";
import shortEncryption from "utils/encryptionHelper/shortEncryption";
import { cookies } from "next/headers";
import passwordHash from "utils/encryptionHelper/passwordHash";
import * as console from "console";
import { API_Response } from "types/api";

export async function GET(
  request: NextRequest,
  { params }: RequestContext<"path", string[]>,
) {
  const _start = Date.now();
  const pathArray = params.path;

  try {
    const fetchRootId =
      apiConfig.files.rootFolder !== "root"
        ? apiConfig.files.rootFolder
        : gdrive.files.get({
            fileId: "root",
            fields: "id",
          });
    const fetchPathId = pathArray.map(async (path) => {
      const query = [
        "trashed = false",
        "'me' in owners",
        `name = '${path}'`,
      ];
      const fetchFolderContents = await gdrive.files.list({
        q: `${query.join(" and ")}`,
        fields: "files(id, name, mimeType, parents)",
      });

      if (!fetchFolderContents.data.files?.length) {
        throw new ExtendedError(
          Constant.apiFileNotFound,
          404,
          "notFound",
          `Path "${path}" is not found`,
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
      fetchRootId,
      Promise.all(fetchPathId),
    ]);

    const selectedPath: string[] = [];
    const mappedPath: FilePath[] = [];

    // Check path validity
    pathId.forEach((path, index) => {
      let checkPath;
      if (index === 0) {
        checkPath = path.data.find(
          (file) => file.parents === rootId,
        );
      } else {
        checkPath = path.data.find(
          (file) =>
            file.parents === selectedPath[index - 1],
        );
      }
      if (!checkPath) {
        throw new ExtendedError(
          Constant.apiFileNotFound,
          404,
          "notFound",
          `Path "${path.path}" is not found`,
        );
      }
      selectedPath.push(checkPath.id as string);
      mappedPath.push({
        name: path.path,
        encryptedId: shortEncryption.encrypt(
          checkPath.id as string,
        ),
        mimeType: checkPath.mimeType as string,
      });
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
          "'me' in owners",
          `'${shortEncryption.decrypt(
            path.encryptedId,
          )}' in parents`,
          `name = '${apiConfig.files.specialFile.password}'`,
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
    protectedFolder = protectedFolder.filter(
      (folder) => folder !== undefined,
    );
    const nearestProtectedFolder =
      protectedFolder[protectedFolder.length - 1] ?? null;
    const masterKey = request.headers.get("x-gdrive-key");
    const validMasterKey = passwordHash.verify(
      masterKey || "",
      apiConfig.masterKey,
    );

    if (
      nearestProtectedFolder &&
      nearestProtectedFolder.passwordId &&
      !validMasterKey
    ) {
      const fetchPassword = await gdrive.files.get(
        {
          fileId: nearestProtectedFolder.passwordId,
          alt: "media",
        },
        { responseType: "text" },
      );

      const userPassword = cookies().get(
        `next-gdrive-password`,
      )?.value;
      if (!userPassword) {
        throw new ExtendedError(
          Constant.apiNotAuthorized,
          401,
          "unauthorized",
          `You need to provide password to access this folder / file`,
        );
      }

      const parsedUserPassword = JSON.parse(userPassword);
      const nearestFolderPassword =
        parsedUserPassword[
          decodeURIComponent(nearestProtectedFolder.path)
        ];
      if (!nearestFolderPassword) {
        throw new ExtendedError(
          Constant.apiNotAuthorized,
          401,
          "unauthorized",
          `You need to provide password to access this folder / file`,
        );
      }

      if (
        !passwordHash.verify(
          fetchPassword.data as string,
          nearestFolderPassword,
        )
      ) {
        throw new ExtendedError(
          Constant.apiNotAuthorized,
          401,
          "unauthorized",
          `The password you provided is incorrect`,
        );
      }
    }

    const payload: API_Response<ValidateFilePathResponse> =
      {
        success: true,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - _start,
        data: mappedPath,
      };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": apiConfig.cacheControl,
      },
    });
  } catch (error: any) {
    const payload = createErrorPayload(
      error,
      `GET /api/verify/${pathArray.join("/")}`,
      _start,
    );

    return NextResponse.json(payload, {
      status: payload.code || 500,
    });
  }
}