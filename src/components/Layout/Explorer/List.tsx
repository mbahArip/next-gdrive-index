import ListItem from "components/File/ListItem";

import { IGDriveFiles } from "types/api/files";

interface ViewListProps {
  data: {
    file: IGDriveFiles | null;
    files: IGDriveFiles[];
    folders: IGDriveFiles[];
    pageToken: string | null;
  };
  isProtected: boolean;
}

export default function ViewList(props: ViewListProps) {
  return (
    <div className='w-full flex flex-col gap-2 rounded-lg'>
      {props.data.folders.map((folder) => (
        <ListItem
          key={folder.encryptedId}
          file={folder}
          isProtected={props.isProtected}
        />
      ))}
      {props.data.files.map((file) => (
        <ListItem
          key={file.encryptedId}
          file={file}
          isProtected={props.isProtected}
        />
      ))}
    </div>
  );
}
