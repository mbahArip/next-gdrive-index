import { GetServerSideProps } from "next";
import { FileResponse } from "types/googleapis";
import axios from "axios";
import { shortDecrypt } from "utils/encryptionHelper";
import { promisify } from "util";
import { pipeline } from "stream";
import driveClient from "utils/driveClient";
import apiConfig from "config/api.config";

export default function Media() {
  return <></>;
}

const pipelineAsync = promisify(pipeline);
export const getServerSideProps: GetServerSideProps =
  async (context) => {
    const { fileId } = context.query;

    const searchFile = await axios.get<FileResponse>(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/files/${fileId}`,
    );
    if (!searchFile.data.success) {
      return {
        notFound: true,
      };
    }

    const id = shortDecrypt(
      searchFile.data.file.id as string,
    );
    const fileName = searchFile.data.file.name as string;
    const mimeType = searchFile.data.file
      .mimeType as string;

    if (
      !mimeType.startsWith("image/") &&
      !mimeType.startsWith("video/") &&
      !mimeType.startsWith("audio/")
    ) {
      return {
        notFound: true,
      };
    }

    if (
      Number(searchFile.data.file.size as string) >
      apiConfig.maxResponseSize
    ) {
      return {
        redirect: {
          destination: shortDecrypt(
            searchFile.data.file.webContentLink as string,
          ),
          permanent: false,
        },
      };
    }

    const getImageStream = await driveClient.files.get(
      {
        fileId: id,
        alt: "media",
      },
      { responseType: "stream" },
    );

    context.res.setHeader("Content-Type", mimeType);
    context.res.setHeader(
      "Content-Disposition",
      `inline; filename="${fileName}"`,
    );

    await pipelineAsync(getImageStream.data, context.res);

    return {
      props: {},
    };
  };
