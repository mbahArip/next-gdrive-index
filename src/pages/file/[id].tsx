import useSWR from "swr";
import fetcher from "@utils/swrFetch";
import {
  ErrorResponse,
  FileResponse,
  FilesResponse,
  TFileParent,
} from "@/types/googleapis";
import Breadcrumb from "@/components/Breadcrumb";
import { useEffect, useState } from "react";
import LoadingFeedback from "@components/APIFeedback/Loading";
import ErrorFeedback from "@components/APIFeedback/Error";
import { useRouter } from "next/router";
import FileDetails from "@components/layout/FileDetails";
import useLocalStorage from "@hooks/useLocalStorage";
import axios from "axios";
import { GetServerSidePropsContext } from "next";

type Props = {
  passwordParent?: string;
};
export default function File({ passwordParent }: Props) {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState<FileResponse>();
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  const [passwordStorage] = useLocalStorage<{
    [key: string]: string;
  }>("passwordStorage", {});

  const {
    data: swrData,
    error,
    isLoading,
  } = useSWR<FileResponse, ErrorResponse>(`/api/files/${id}`, (url, headers) =>
    axios
      .get<FileResponse>(url, {
        headers: {
          Authorization: `Bearer ${
            passwordStorage?.[passwordParent as string] ||
            passwordStorage?.[id as string] ||
            ""
          }`,
          ...headers,
        },
      })
      .then((res) => res.data),
  );

  useEffect(() => {
    setDataLoading(true);
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
      setDataLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swrData, error, isLoading]);

  return (
    <div className='mx-auto flex max-w-screen-xl flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <Breadcrumb
          data={data?.parents || []}
          isLoading={dataLoading}
        />
      </div>

      {isLoading && <LoadingFeedback message={"Loading file details..."} />}
      {!isLoading && error && <ErrorFeedback message={error.errors?.message} />}
      {!isLoading && !error && data && (
        <FileDetails
          data={data.file}
          hash={passwordStorage?.[passwordParent as string] || ""}
        />
      )}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  const passwordParent = await axios.get(
    `http://localhost:5000/api/files/${id}`,
  );

  if (passwordParent) {
    return {
      props: {
        passwordParent: passwordParent.data.protectedId || null,
      },
    };
  } else {
    return {
      props: {
        passwordParent: "",
      },
    };
  }
}
