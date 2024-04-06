import { NextRequest, NextResponse } from "next/server";
import {
  CheckDownloadToken,
  CheckPassword,
  CheckPaths,
  CheckSitePassword,
  RedirectSearchFile,
} from "~/app/actions";

import { decryptData } from "~/utils/encryptionHelper/hash";
import gdrive from "~/utils/gdriveInstance";

import config from "~/config/gIndex.config";

export async function GET(
  request: NextRequest,
  {
    params: { encryptedId },
  }: {
    params: {
      encryptedId: string;
    };
  },
) {
  try {
    const sp = new URL(request.nextUrl).searchParams;
    const token = sp.get("token");
    if (!token) throw new Error("Token not found");

    const tokenValidity = await CheckDownloadToken(token);
    if (!tokenValidity.success) throw new Error(tokenValidity.message);

    if (config.siteConfig.privateIndex) {
      const unlocked = await CheckSitePassword();
      if (!unlocked.success) {
        return new NextResponse(
          `It seems like this site is protected by password, and you haven't entered the password yet.

If you've already entered the password, please make sure your browser is not blocking cookies from this site.`,
          {
            status: 401,
          },
        );
      }
    }

    const decryptedId = await decryptData(encryptedId);
    const _filePaths = RedirectSearchFile(encryptedId);
    const _fileMeta = gdrive.files.get({
      fileId: decryptedId,
      fields: "id, name, mimeType, fileExtension, webContentLink",
      supportsAllDrives: config.apiConfig.isTeamDrive,
    });
    const _fileContent = gdrive.files.get(
      {
        fileId: decryptedId,
        alt: "media",
        supportsAllDrives: config.apiConfig.isTeamDrive,
      },
      {
        responseType: "stream",
      },
    );

    const [fileMeta, fileContent, filePaths] = await Promise.all([
      _fileMeta,
      _fileContent,
      _filePaths,
    ]);
    if (!config.apiConfig.allowDownloadProtectedFile) {
      const checkPath = await CheckPaths(filePaths.split("/"));
      if (!checkPath.success) throw new Error("File not found");
      const unlocked = await CheckPassword(checkPath.data);
      if (!unlocked.success) {
        if (!unlocked.path)
          throw new Error("No path returned from password checking");

        const lockedIndex = checkPath.data.findIndex(
          (path) => path.id === unlocked.path,
        );
        // Get all path until the locked index, then join them
        const path = checkPath.data
          .slice(0, lockedIndex + 1)
          .map((path) => path.path)
          .join("/");
        return new NextResponse(
          `The file you're trying to access is protected by password.
Please open the file link and enter the password to access the file, then try to download the file again.

Protected Path: ${new URL(path, config.basePath).toString()}

If you've already entered the password, please make sure your browser is not blocking cookies from this site.`,
          {
            status: 401,
          },
        );
      }
    }

    const fileSize = Number(fileMeta.data.size || 0);
    if (!fileMeta.data.webContentLink)
      throw new Error("No download link found");

    if (
      config.apiConfig.maxFileSize &&
      fileSize > config.apiConfig.maxFileSize
    ) {
      return NextResponse.redirect(fileMeta.data.webContentLink, {
        status: 302,
        headers: {
          ...request.headers,
          "Cache-Control": config.cacheControl,
        },
      });
    }

    const fileBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      fileContent.data.on("data", (chunk) => {
        chunks.push(chunk);
      });
      fileContent.data.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      fileContent.data.on("error", (err) => {
        reject(err);
      });
    });

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        ...request.headers,
        "Content-Type": fileMeta.data.mimeType || "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          fileMeta.data.name || `Untitled.${fileMeta.data.fileExtension}`,
        )}"`,
        "Cache-Control": config.cacheControl,
      },
    });
    // const data = await GetFile(encryptedId);
    // if (data.mimeType?.includes("folder"))
    //   throw new Error("Can't download folder");
    // if (!data.encryptedWebContentLink)
    //   throw new Error("No download link found");

    // const decryptedWebContent = await decryptData(data.encryptedWebContentLink);
    // return new NextResponse(null, {
    //   status: 302,
    //   headers: {
    //     Location: decryptedWebContent,
    //   },
    // });
  } catch (error) {
    const e = error as Error;
    console.error(e.message);
    return new NextResponse(e.message, {
      status: 500,
    });
  }
}
