import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import ButtonIcon from "components/ButtonIcon";
import ClickAway from "components/ClickAway";
import Tooltip from "components/Tooltip";

import bytesToReadable from "utils/bytesFormat";
import { stripExtension } from "utils/filesHelper";
import { generatedDownloadLink } from "utils/generateDownloadLink";
import { getPreviewIcon } from "utils/previewHelper";
import { createDownloadToken } from "utils/tokenHelper";

import { IGDriveFiles } from "types/api/files";

interface ListItemProps {
  file: IGDriveFiles;
  isProtected: boolean;
}
export default function ListItem(props: ListItemProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>();

  const [fileInfo, setFileInfo] = useState<string[]>([]);
  const [extensionInfo, setExtensionInfo] = useState<string[]>([]);
  const [filePath, setFilePath] = useState<string>("");

  useEffect(() => {
    const currentPath = router.asPath.slice(1);
    const filePath = props.file.name;
    const path = [currentPath, encodeURIComponent(filePath)].join("/");

    // If start with /, remove it
    if (path.startsWith("/")) {
      setFilePath(path.slice(1));
    } else {
      setFilePath(path);
    }
  }, [router.asPath, props.file.name]);

  useEffect(() => {
    const info = [];
    const extInfo = [];
    props.file.modifiedTime &&
      info.push(
        new Date(props.file.modifiedTime).toLocaleDateString("default", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      );
    props.file.size && info.push(bytesToReadable(props.file.size));
    props.file.mimeType && props.file.mimeType.includes("folder") && extInfo.push("Folder");
    props.file.fileExtension && extInfo.push(props.file.fileExtension.toUpperCase());
    setExtensionInfo(extInfo);
    setFileInfo(info);
  }, [props.file]);

  const handleCopyFileLink = () => {
    try {
      const url = `${window.location.origin}/${filePath}`;
      navigator.clipboard.writeText(url);
      toast.success("Download URL copied to clipboard.");
    } catch (error: any) {
      toast.error("Failed to copy Download URL to clipboard.");
      console.error(error.message);
    } finally {
      setMenuOpen(false);
    }
  };
  const handleCopyDownloadLink = (file: IGDriveFiles, isProtected: boolean = false) => {
    try {
      const url = generatedDownloadLink(file, isProtected, true, isProtected ? createDownloadToken() : undefined);
      navigator.clipboard.writeText(url);
      toast.success("Download URL copied to clipboard.");
    } catch (error: any) {
      toast.error("Failed to copy Download URL to clipboard.");
      console.error(error.message);
    } finally {
      setMenuOpen(false);
    }
  };
  const handleDownload = (file: IGDriveFiles, isProtected: boolean = false) => {
    window.open(
      generatedDownloadLink(file, isProtected, true, isProtected ? createDownloadToken() : undefined),
      "_blank",
    );
    setMenuOpen(false);
  };

  return (
    <>
      <Link
        title={props.file.name}
        href={filePath}
        className='w-full p-1 pr-2 flex items-center gap-4 tablet:gap-8 justify-between bg-primary-950 border border-primary-700 hover:bg-primary-900 transition-smooth text-primary-50 rounded-lg'
      >
        <div className='flex items-center gap-4 w-full flex-grow-0 flex-shrink'>
          {props.file.thumbnailLink &&
          (props.file.mimeType.startsWith("video") || props.file.mimeType.startsWith("image")) ? (
            <img
              src={props.file.thumbnailLink}
              alt={props.file.name}
              className='rounded-md object-cover flex-shrink-0 flex-grow-0 w-16 h-16'
              loading='lazy'
            />
          ) : (
            <Icon
              icon={
                props.file.mimeType === "application/vnd.google-apps.folder"
                  ? "ion:folder"
                  : getPreviewIcon(props.file.fileExtension!, props.file.mimeType!)
              }
              color='currentColor'
              className='flex-shrink-0 flex-grow-0 w-16 h-16 p-4'
            />
          )}
          <div className='flex flex-col'>
            <span className='line-clamp-1 break-all whitespace-pre-wrap'>
              {props.file.fileExtension ? stripExtension(props.file.name, props.file.fileExtension) : props.file.name}
            </span>{" "}
            <div className='flex items-center justify-start gap-2 text-primary-500'>
              <span className='text-sm whitespace-nowrap'>{extensionInfo.join(" ・ ")}</span>
            </div>
            <div className='flex items-center justify-start gap-2 text-primary-500'>
              <span className='text-sm whitespace-nowrap'>{fileInfo.join(" ・ ")}</span>
            </div>
          </div>
        </div>
        <div className='relative z-10'>
          <Tooltip content='More'>
            <ButtonIcon
              ref={setMenuAnchor}
              icon='ion:ellipsis-vertical'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
            />
          </Tooltip>
        </div>
      </Link>

      <ClickAway
        open={menuOpen}
        onClickAway={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(false);
        }}
        className={`w-screen h-screen z-30 fixed top-0 left-0 transition-smooth backdrop-blur-none ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          id='more-menu'
          className={`absolute drop-shadow-md mr-4 w-48 bg-primary-800 rounded-lg shadow-lg overflow-hidden transition-opacity transition-smooth ${
            menuOpen ? `opacity-100 pointer-events-auto` : `opacity-0 pointer-events-none `
          }`}
          style={{
            top: menuAnchor ? (menuAnchor?.getBoundingClientRect().bottom ?? 0) - 36 : "unset",
            left: menuAnchor ? (menuAnchor?.getBoundingClientRect().left ?? 0) - 200 : "unset",
          }}
        >
          <div className='w-full bg-primary-800 flex flex-col gap-1'>
            {props.file.mimeType.includes("folder") ? (
              <>
                <div
                  className='flex items-center gap-2 hover:bg-primary-50 hover:text-primary-950 cursor-pointer p-2'
                  onClick={handleCopyFileLink}
                >
                  <Icon
                    icon='ion:share-social'
                    color='currentColor'
                    width={18}
                    height={18}
                  />
                  <span>Copy folder link</span>
                </div>
              </>
            ) : (
              <>
                <div
                  className='flex items-center gap-2 hover:bg-primary-50 hover:text-primary-950 cursor-pointer p-2'
                  onClick={handleCopyFileLink}
                >
                  <Icon
                    icon='ion:share-social'
                    color='currentColor'
                    width={18}
                    height={18}
                  />
                  <span>Copy file link</span>
                </div>
                <div
                  className='flex items-center gap-2 hover:bg-primary-50 hover:text-primary-950 cursor-pointer p-2'
                  onClick={() => handleCopyDownloadLink(props.file, props.isProtected)}
                >
                  <Icon
                    icon='ion:share-social'
                    color='currentColor'
                    width={18}
                    height={18}
                  />
                  <span>Copy download link</span>
                </div>
                <div className='w-full h-px bg-primary-500' />
                <div
                  className='flex items-center gap-2 hover:bg-primary-50 hover:text-primary-950 cursor-pointer p-2'
                  onClick={() => handleDownload(props.file, props.isProtected)}
                >
                  <Icon
                    icon='ion:download'
                    color='currentColor'
                    width={18}
                    height={18}
                  />
                  <span>Download</span>
                </div>
              </>
            )}
          </div>
        </div>
      </ClickAway>
    </>
  );
}
