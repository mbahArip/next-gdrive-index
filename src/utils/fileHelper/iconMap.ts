import { IconType } from "react-icons";
import {
  BsBoxFill,
  BsDatabaseFill,
  BsFileEarmarkBinaryFill,
  BsFileEarmarkCodeFill,
  BsFileEarmarkFill,
  BsFileEarmarkFontFill,
  BsFileEarmarkImageFill,
  BsFileEarmarkMusicFill,
  BsFileEarmarkPdfFill,
  BsFileEarmarkPlayFill,
  BsFileEarmarkRichtextFill,
  BsFileEarmarkSlidesFill,
  BsFileEarmarkSpreadsheetFill,
  BsFileEarmarkTextFill,
  BsFileEarmarkWordFill,
  BsFileEarmarkZipFill,
} from "react-icons/bs";

import { typeGroup } from "./fileGroup";
import { extensionMap, overlapVideo } from "./typeMap";

const iconMap: Record<keyof typeof typeGroup, IconType> = {
  "3d": BsBoxFill,
  "archive": BsFileEarmarkZipFill,
  "audio": BsFileEarmarkMusicFill,
  "rich_text": BsFileEarmarkRichtextFill,
  "officeWord": BsFileEarmarkWordFill,
  "officeExcel": BsFileEarmarkSpreadsheetFill,
  "officePowerPoint": BsFileEarmarkSlidesFill,
  "pdf": BsFileEarmarkPdfFill,
  "database": BsDatabaseFill,
  "image": BsFileEarmarkImageFill,
  "code": BsFileEarmarkCodeFill,
  "text": BsFileEarmarkTextFill,
  "video": BsFileEarmarkPlayFill,
  "font": BsFileEarmarkFontFill,
  "default": BsFileEarmarkFill,
  "binary": BsFileEarmarkBinaryFill,
};

function getFileIcon(
  extension: string,
  mimeType?: string,
): IconType {
  if (overlapVideo.includes(extension)) {
    const isVideo = !!mimeType?.includes("video");
    if (isVideo) {
      return iconMap["video"];
    }
  }

  const iconGroup =
    extensionMap[extension as keyof typeof extensionMap] ||
    typeGroup.default;
  return iconMap[iconGroup as keyof typeof typeGroup];
}

export default getFileIcon;
