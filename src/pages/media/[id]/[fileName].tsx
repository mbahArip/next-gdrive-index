import { promisify } from "util";
import { pipeline } from "stream";
import { GetServerSideProps } from "next";
import drive from "@utils/driveClient";

export default function Media() {
  return <div />;
}

const pipelineAsync = promisify(pipeline);

export const getServerSideProps: GetServerSideProps = async ({
  res,
  query,
}) => {
  const { id, fileName } = query;
  const getImageMetadata = drive.files.get({
    fileId: id as string,
    fields: "name, mimeType",
  });
  const getImageStream = drive.files.get(
    {
      fileId: id as string,
      alt: "media",
    },
    { responseType: "stream" },
  );

  const [{ data: imageMetadata }, imageStream] = await Promise.all([
    getImageMetadata,
    getImageStream,
  ]);
  // Only allow images, video, audio, and pdf
  if (
    !(imageMetadata.mimeType as string).startsWith("image/") &&
    !(imageMetadata.mimeType as string).startsWith("video/") &&
    !(imageMetadata.mimeType as string).startsWith("audio/") &&
    !(imageMetadata.mimeType as string).startsWith("application/pdf")
  ) {
    return {
      notFound: true,
    };
  }
  //     Check fileName === image metadata
  if (fileName !== imageMetadata.name) {
    return {
      notFound: true,
    };
  }
  res.setHeader("Content-Type", imageMetadata.mimeType as string);
  await pipelineAsync(imageStream.data, res);
  return {
    props: {},
  };
};
