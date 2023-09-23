import axios from "axios";
import gIndexConfig from "config";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import ExplorerLayout from "components/Layout/Explorer";
import LoaderLayout from "components/Layout/Loader";
import PasswordLayout from "components/Layout/Password";
import PreviewLayout from "components/Layout/Preview";

import { decryptData, encryptData } from "utils/encryptionHelper/hash";
import { gdriveFilesList } from "utils/gdrive";
import gdrive from "utils/gdriveInstance";
import { addNewPassword, checkPathPassword } from "utils/passwordHelper";

import { IGDriveFiles } from "types/api/files";
import { APIGetFileResponse, APIGetPasswordResponse, APIGetReadmeResponse } from "types/api/response";
import { Constant } from "types/constant";

interface FilePathPageProps {
  mappedEncryptedPath: Record<"name" | "id" | "mimeType", string>[];
}
interface StateDataProps {
  file: IGDriveFiles | null;
  files: IGDriveFiles[];
  folders: IGDriveFiles[];
  pageToken: string | null;
}
export default function FilePathPage(props: FilePathPageProps) {
  const router = useRouter();
  const [data, setData] = useState<StateDataProps>({
    file: null,
    files: [],
    folders: [],
    pageToken: null,
  });
  const [readmeFile, setReadmeFile] = useState<string | null>(null);
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [nearestProtected, setNearestProtected] = useState<string>("");
  const [isFileProtected, setIsFileProtected] = useState<boolean>(false);
  const [isFile, setIsFile] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  useEffect(() => {
    setIsLoadingData(true);

    const lastPathMimeType = props.mappedEncryptedPath[(props.mappedEncryptedPath.length ?? 1) - 1].mimeType;
    let isLastPathFile = false;
    if (lastPathMimeType === "application/vnd.google-apps.folder") {
      isLastPathFile = false;
      setIsFile(false);
    } else {
      isLastPathFile = true;
      setIsFile(true);
    }

    const _getPassword = axios.get<APIGetPasswordResponse>("/api/getPassword", {
      params: {
        path: encryptData(JSON.stringify(props.mappedEncryptedPath)),
      },
    });
    const _getData = axios.get<APIGetFileResponse>("/api/getData", {
      params: {
        encryptedId: props.mappedEncryptedPath[props.mappedEncryptedPath.length - 1].id,
        isFile: isLastPathFile ? "1" : undefined,
      },
    });
    const _getReadme = axios.get<APIGetReadmeResponse>("/api/getReadme", {
      params: {
        encryptedId: props.mappedEncryptedPath[props.mappedEncryptedPath.length - 1].id,
      },
    });

    Promise.all([_getPassword, _getData, _getReadme])
      .then(async ([passwordData, fileData, readmeData]) => {
        // Check password
        if (passwordData.data.data && passwordData.data.data.length) {
          let isPathProtected = true;
          const savedPasswordCookie =
            document.cookie.split(";").find((cookie) => cookie.startsWith(`${Constant.cookies_SitePassword}=`)) ??
            undefined;
          const savedPasswordValue = savedPasswordCookie?.split("=")[1] ?? undefined;

          if (savedPasswordValue) {
            // Check only nearest path
            const nearestPassword = passwordData.data.data[passwordData.data.data.length - 1];
            setNearestProtected(nearestPassword.relativePath);
            const isPasswordValid = checkPathPassword(
              nearestPassword.relativePath,
              savedPasswordValue,
              decryptData(nearestPassword.password),
            );
            if (isPasswordValid) {
              isPathProtected = false;
            }
          }

          setIsProtected(isPathProtected);
          setIsFileProtected(true);
        }

        // Assign files
        setData(fileData.data.data);

        // Fetch readme
        setReadmeFile(readmeData.data.data);
      })
      .catch((err) => {
        console.error(err);
        throw new Error(err);
      })
      .finally(() => {
        setIsLoadingData(false);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mappedEncryptedPath]);

  return (
    <LoaderLayout
      seo={{
        title: props.mappedEncryptedPath[(props.mappedEncryptedPath.length ?? 1) - 1].name,
        openGraph: {
          type: "website",
          title: props.mappedEncryptedPath[(props.mappedEncryptedPath.length ?? 1) - 1].name,
          description: gIndexConfig.siteConfig.siteDescription,
          url: process.env.NEXT_PUBLIC_VERCEL_URL,
          siteName: gIndexConfig.siteConfig.siteName,
          images: [
            {
              url: `/og.png`,
              width: 1200,
              height: 630,
            },
          ],
        },
      }}
    >
      {isLoadingData ? (
        <div className='w-full h-full flex items-center justify-center'>
          <div className='flex flex-col gap-4 items-center justify-center animate-pulse'>
            <div className='w-fit h-fit relative grid place-items-center'>
              <img
                src={gIndexConfig.siteConfig.siteIcon}
                alt={gIndexConfig.siteConfig.siteName}
                className='w-12 -top-1 relative'
              />
              <div className='absolute w-12 h-12 bg-transparent border border-primary-50 rounded-full animate-ping' />
            </div>
            <span>Fetching {isFile ? "file info" : "folder contents"}...</span>
          </div>
        </div>
      ) : (
        <>
          {isProtected ? (
            <PasswordLayout
              path={nearestProtected}
              onSubmitted={(password) => {
                const cookie =
                  document.cookie.split(";").find((cookie) => cookie.startsWith(`${Constant.cookies_SitePassword}=`)) ??
                  undefined;
                addNewPassword(decodeURIComponent(nearestProtected), password, cookie?.split("=")[1] ?? undefined);
                router.reload();
              }}
            />
          ) : (
            <>
              {isFile ? (
                <PreviewLayout
                  key={router.asPath}
                  data={data}
                  isProtected={false}
                  isFileProtected={isFileProtected}
                  encryptedId={props.mappedEncryptedPath[(props.mappedEncryptedPath.length ?? 1) - 1].id}
                />
              ) : (
                <ExplorerLayout
                  key={router.asPath}
                  data={data}
                  readmeFile={readmeFile}
                  isProtected={false}
                  isFileProtected={isFileProtected}
                  encryptedId={props.mappedEncryptedPath[(props.mappedEncryptedPath.length ?? 1) - 1].id}
                />
              )}
            </>
          )}
        </>
      )}
    </LoaderLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { path } = context.params as { path: string[] };

  const fetchRootId = gdrive.files.get({
    fileId: gIndexConfig.apiConfig.rootFolder,
    fields: "id",
    supportsAllDrives: true,
  });
  const fetchPathId = path.map(async (path) => {
    const query = ["trashed = false", `name = '${path}'`];
    const fetchFolderContents = await gdriveFilesList({
      q: `${query.join(" and ")}`,
      fields: "files(id, name, mimeType, parents)",
    });

    if (!fetchFolderContents.data.files?.length) {
      return {
        path,
        data: [],
      };
    }

    return {
      path,
      data: fetchFolderContents.data.files.map((file) => ({
        id: file.id,
        parents: file.parents?.[0],
        mimeType: file.mimeType,
      })),
    };
  });

  const [rootId, pathId] = await Promise.all([fetchRootId, Promise.all(fetchPathId)]);

  if (pathId.some((path) => !path.data.length)) {
    return {
      notFound: true,
    };
  }

  const selectedPath: string[] = [];
  const mappedPath: Record<"name" | "id" | "mimeType", string>[] = [];
  const rejectedPath: string[] = [];

  // Check path validity
  pathId.forEach((path, index) => {
    let checkPath =
      index === 0
        ? path.data.find((file) => file.parents === rootId.data.id)
        : path.data.find((file) => file.parents === selectedPath[index - 1]);
    if (!checkPath) {
      rejectedPath.push(path.path);
      return;
    }
    selectedPath.push(checkPath.id as string);
    mappedPath.push({
      name: path.path,
      id: checkPath.id as string,
      mimeType: checkPath.mimeType as string,
    });
  });
  if (rejectedPath.length) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      mappedEncryptedPath: mappedPath.map((path) => ({
        name: path.name,
        id: encryptData(path.id),
        mimeType: path.mimeType,
      })),
    },
  };
}
