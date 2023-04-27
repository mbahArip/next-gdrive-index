import { promisify } from "util";
import { pipeline } from "stream";
import { GetServerSideProps } from "next";
import drive from "@utils/driveClient";

export default function Download() {
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
  //     Check fileName === image metadata
  if (fileName !== imageMetadata.name) {
    return {
      notFound: true,
    };
  }
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${encodeURIComponent(imageMetadata.name as string)}`,
  );
  res.setHeader(
    "Content-Type",
    (imageMetadata.mimeType as string) || "application/octet-stream",
  );
  await pipelineAsync(imageStream.data, res);
  return {
    props: {},
  };
};
