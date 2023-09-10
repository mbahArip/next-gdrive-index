import GridItem from "components/File/GridItem";

import { IGDriveFiles } from "types/api/files";

interface GridViewProps {
  data: {
    file: IGDriveFiles | null;
    files: IGDriveFiles[];
    folders: IGDriveFiles[];
    pageToken: string | null;
  };
  isProtected: boolean;
}

export default function ViewGrid(props: GridViewProps) {
  return (
    <div className='w-full gap-4 grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4'>
      {props.data.folders.map((folder) => (
        <GridItem
          key={folder.encryptedId}
          file={folder}
          isProtected={props.isProtected}
        />
      ))}
      {props.data.files.map((file) => (
        <GridItem
          key={file.encryptedId}
          file={file}
          isProtected={props.isProtected}
        />
      ))}
    </div>
  );
}
