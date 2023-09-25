import gIndexConfig from "config";
import { NextRequest, NextResponse } from "next/server";

import getSearchParams from "utils/apiHelper/getSearchParams";
import { decryptData, encryptData } from "utils/encryptionHelper/hash";
import ExtendedError from "utils/extendedError";
import { gdriveFilesList } from "utils/gdrive";
import gdrive from "utils/gdriveInstance";

import { APIGetPasswordResponse, ErrorResponse } from "types/api/response";

export async function GET(request: NextRequest) {
  const reqStart = Date.now();

  try {
    const { path } = getSearchParams(request.url, ["path"]);
    if (!path) throw new ExtendedError("Path is required", 400, "Can't find path in query, please check your query");
    const mappedPath: Record<"name" | "id" | "mimeType", string>[] = JSON.parse(decryptData(path));
    const passwordParents = mappedPath.map((path) => `'${decryptData(path.id)}' in parents`);
    const query: string[] = [
      "trashed = false",
      `name = '${gIndexConfig.apiConfig.specialFile.password}' and (${passwordParents.join(" or ")})`,
    ];
    const passwordData = await gdriveFilesList({
      q: query.join(" and "),
      fields: "files(id, name, parents)",
    });

    const protectedPaths = mappedPath.map((path) => {
      const isPasswordExist = passwordData.data.files?.find((file) => file.parents?.[0] === decryptData(path.id));
      if (isPasswordExist)
        return {
          name: path.name,
          passwordId: isPasswordExist.id,
        };
    });

    const _passwordContent: Promise<{
      path: string;
      password: string;
    }>[] = [];
    protectedPaths.forEach((path) => {
      if (!path) return;
      _passwordContent.push(
        gdrive.files
          .get(
            {
              fileId: path.passwordId as string,
              alt: "media",
              supportsAllDrives: gIndexConfig.apiConfig.isTeamDrive,
            },
            { responseType: "text" },
          )
          .then((res) => ({
            path: path.name as string,
            password: res.data as string,
          })),
      );
    });

    const passwordContent = await Promise.all(_passwordContent);

    let prevPath = [""];
    let password: Record<"relativePath" | "password", string>[] = [];

    mappedPath.forEach((path) => {
      prevPath.push(path.name);
      const isPasswordExist = passwordContent.find((password) => password.path === path.name);
      if (isPasswordExist) {
        password.push({
          relativePath: prevPath.join("/"),
          password: encryptData(isPasswordExist.password),
        });
      }
    });

    const payload: APIGetPasswordResponse = {
      timestamp: Date.now(),
      responseTime: Date.now() - reqStart,
      data: password,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": gIndexConfig.cacheControl,
      },
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
