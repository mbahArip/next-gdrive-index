import { GetServerSideProps } from "next";
import driveClient from "@utils/driveClient";
import { promisify } from "util";
import { pipeline } from "stream";

export default function Test() {
  return <div />;
}

const pipelineAsync = promisify(pipeline);
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const getImageMetadata = driveClient.files.get({
    fileId: "1uAmdeBGJPAEkyEG_M_gYczjP0eVy6ncH",
    fields: "name, mimeType",
  });
  const getImageStream = driveClient.files.get(
    {
      fileId: "1uAmdeBGJPAEkyEG_M_gYczjP0eVy6ncH",
      alt: "media",
    },
    { responseType: "stream" },
  );
  const [imageMetadata, imageStream] = await Promise.all([
    getImageMetadata,
    getImageStream,
  ]);
  res.setHeader("Content-Type", imageMetadata.data.mimeType as string);
  await pipelineAsync(imageStream.data, res);

  return {
    props: {},
  };
};
