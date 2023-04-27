import useSWR from "swr";
import { ErrorResponse, FileResponse, TFileParent } from "@/types/googleapis";
import Breadcrumb from "@/components/Breadcrumb";
import { useCallback, useEffect, useState } from "react";
import LoadingFeedback from "@components/APIFeedback/Loading";
import ErrorFeedback from "@components/APIFeedback/Error";
import { useRouter } from "next/router";
import FileDetails from "@components/layout/FileDetails";
import useLocalStorage from "@hooks/useLocalStorage";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Password from "@components/layout/Password";
import { NextSeo } from "next-seo";

type Props = {
  passwordParent?: string;
  fileName?: string;
};
export default function File({ passwordParent, fileName }: Props) {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState<FileResponse>();
  const [globalLoading, setGlobalLoading] = useState<boolean>(true);

  const [passwordStorage, setPasswordStorage] = useLocalStorage<{
    [key: string]: string;
  }>("passwordStorage", {});
  const [password, setPassword] = useState<{ [p: string]: string }>(
    passwordStorage,
  );

  const {
    data: swrData,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<FileResponse, ErrorResponse>(
    `/api/files/${id}`,
    (url, headers) =>
      axios
        .get<FileResponse>(url, {
          headers: {
            Authorization: `Bearer ${
              password?.[passwordParent as string] ||
              password?.[id as string] ||
              passwordStorage?.[passwordParent as string] ||
              passwordStorage?.[id as string] ||
              ""
            }`,
            ...headers,
          },
        })
        .then((res) => res.data),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
      refreshInterval: 0,
      shouldRetryOnError: false,
      revalidateIfStale: true,
    },
  );

  useEffect(() => {
    setGlobalLoading(true);
    if (swrData) {
      const parentsArray: TFileParent[] | undefined = swrData.parents;
      parentsArray?.unshift({
        id: swrData.file.id as string,
        name: swrData.file.name as string,
      });
      const payload: FileResponse = {
        parents: parentsArray,
        ...swrData,
      };
      setData(payload);
      setGlobalLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swrData, error, isLoading, isValidating, password]);

  useEffect(() => {
    if (!isLoading && !isValidating) {
      setGlobalLoading(false);
    } else {
      setGlobalLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isValidating]);

  useEffect(() => {
    mutate(swrData, {
      revalidate: true,
    }).then((r) => {
      return r;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const inputPassCallback = useCallback(
    (data: { [p: string]: string }) => {
      setGlobalLoading(true);
      setPasswordStorage(data);
      setPassword(data);
    },
    [setPasswordStorage],
  );

  return (
    <div className='mx-auto flex max-w-screen-xl flex-col gap-4'>
      <NextSeo title={fileName || "File preview"} />

      <div className='flex items-center justify-between'>
        <Breadcrumb
          data={data?.parents || []}
          isLoading={globalLoading}
        />
      </div>
      {globalLoading && <LoadingFeedback message={"Loading file details..."} />}
      {!globalLoading && error && (
        <ErrorFeedback message={error.errors?.message} />
      )}
      {!globalLoading && !error && data && (
        <>
          {data.passwordRequired && !data.passwordValidated && (
            <Password
              folderId={(passwordParent as string) || (id as string)}
              inputCallback={inputPassCallback}
            />
          )}
          {(data.passwordValidated || !data.passwordRequired) && (
            <>
              <FileDetails
                data={data.file}
                hash={passwordStorage?.[passwordParent as string] || ""}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  const data = await axios.get(`http://localhost:5000/api/files/${id}`);

  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59",
  );

  if (data) {
    return {
      props: {
        passwordParent: data.data.protectedId || null,
        fileName: data.data.file.name,
      },
    };
  } else {
    return {
      props: {
        passwordParent: "",
        fileName: "",
      },
    };
  }
}
