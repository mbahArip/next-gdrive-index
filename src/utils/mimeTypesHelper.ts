import mime from "mime-types";
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
import ModelPreview from "@components/FilePreview/ModelPreview";
import AudioPreview from "@components/FilePreview/AudioPreview";
import DefaultPreview from "@components/FilePreview/DefaultPreview";
import MarkdownPreview from "@components/FilePreview/MarkdownPreview";
import OfficePreview from "@components/FilePreview/OfficePreview";
import PDFPreview from "@components/FilePreview/PDFPreview";
import ImagePreview from "@components/FilePreview/ImagePreview";
import CodePreview from "@components/FilePreview/CodePreview";
import TextPreview from "@components/FilePreview/TextPreview";
import VideoPreview from "@components/FilePreview/VideoPreview";

import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

function findMimeType(extension: string): string {
  return mime.lookup(extension) || "application/octet-stream";
}

const type = {
  "3d": "3d", // model preview
  "audio": "audio", // audio preview
  "archive": "archive", // default preview
  "rich_text": "rich_text", // markdown preview
  "officeWord": "officeWord", // office preview
  "officeExcel": "officeExcel", // office preview
  "officePowerPoint": "officePowerPoint", // office preview
  "pdf": "pdf", // pdf preview
  "database": "database", // default preview
  "image": "image", // image preview
  "code": "code", // code preview
  "text": "text", // text preview
  "video": "video", // video preview
  "font": "font", // default preview
  "default": "default", // default preview
  "binary": "binary", // default preview
};

const iconsForType: { [key: string]: IconType } = {
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

const overlapVideo = ["ts", "ogg"];

const extToTypeMap: { [key: string]: string } = {
  // 3D models
  "fbx": type["3d"],
  "obj": type["3d"],
  "stl": type["3d"],
  "gltf": type["3d"],
  "glb": type["3d"],

  // Audio
  "aac": type.audio,
  "flac": type.audio,
  "m4a": type.audio,
  "mp3": type.audio,
  "ogg": type.audio, // Check for audio or video
  "opus": type.audio,
  "wav": type.audio,

  // Archives
  "7z": type.default,
  "bz2": type.default,
  "gz": type.default,
  "rar": type.default,
  "tar": type.default,
  "zip": type.default,

  // Rich text
  "md": type.rich_text,

  // Office
  "doc": type.officeWord,
  "docx": type.officeWord,
  "odt": type.officeWord,
  "xls": type.officeExcel,
  "xlsx": type.officeExcel,
  "ods": type.officeExcel,
  "ppt": type.officePowerPoint,
  "pptx": type.officePowerPoint,
  "odp": type.officePowerPoint,

  // PDF
  "pdf": type.pdf,

  // Database
  "db": type.database,
  "dbf": type.database,
  "mdb": type.database,
  "pdb": type.database,
  "sql": type.database,
  "csv": type.database,
  "tsv": type.database,

  // Images
  "bmp": type.image,
  "gif": type.image,
  "jpg": type.image,
  "jpeg": type.image,
  "png": type.image,
  "svg": type.image,
  "webp": type.image,
  "apng": type.image, //Should be able to preview according to MDN
  "avif": type.image,
  "ico": type.image,

  // Code

  "c": type.code,
  "cpp": type.code,
  "cs": type.code,
  "css": type.code,
  "go": type.code,
  "h": type.code,
  "html": type.code,
  "ini": type.code,
  "java": type.code,
  "js": type.code,
  "json": type.code,
  "jsx": type.code,
  "php": type.code,
  "py": type.code,
  "rb": type.code,
  "rs": type.code,
  "rust": type.code,
  "sass": type.code,
  "scss": type.code,
  "sh": type.code,
  "swift": type.code,
  "ts": type.code, // Check for video also
  "tsx": type.code,
  "xml": type.code,
  "yaml": type.code,
  "vue": type.code,
  "toml": type.code,

  // Text
  "txt": type.text,

  // Video
  "mp4": type.video,
  "webm": type.video,
  "3gp": type.video,
  "mpeg": type.video,
  "mov": type.video,
  "mkv": type.video,

  // Fonts
  "woff": type.font,
  "woff2": type.font,
  "ttf": type.font,
  "otf": type.font,

  // Binary
  "dat": type.binary,
  "bin": type.binary,
  "exe": type.binary,
  "dll": type.binary,
  "msi": type.binary,
};

export function getFilePreview(extension: string, mimeType?: string) {
  if (overlapVideo.includes(extension)) {
    const isVideo = !!mimeType?.startsWith("video");
    if (isVideo) {
      return VideoPreview;
    }
  }
  const category = extToTypeMap[extension] || type.default;
  switch (category) {
    // case type["3d"]:
    //   return ModelPreview;
    case type.audio:
      return AudioPreview;
    case type.rich_text:
      return MarkdownPreview;
    case type.officeWord:
    case type.officeExcel:
    case type.officePowerPoint:
      return OfficePreview;
    case type.pdf:
      return PDFPreview;
    case type.image:
      return ImagePreview;
    case type.code:
      return CodePreview;
    case type.text:
      return TextPreview;
    case type.video:
      return VideoPreview;
    default:
      return DefaultPreview;
  }
}

export function getFileIcon(extension: string, mimeType?: string): IconType {
  if (overlapVideo.includes(extension)) {
    const isVideo = !!mimeType?.startsWith("video");
    if (isVideo) {
      return iconsForType["video"];
    }
  }
  const category = extToTypeMap[extension] || type.default;
  return iconsForType[category];
}

// Not all extensions are included here
// Taken from onedrive-vercel-index by SpencerWoo
// https://github.com/spencerwooo/onedrive-vercel-index/blob/main/src/utils/getPreviewType.ts
export function getCodeLanguage(extension: string) {
  switch (extension) {
    case "ts":
    case "tsx":
      return "typescript";
    case "rs":
      return "rust";
    case "js":
    case "jsx":
    case "vue":
      return "javascript";
    case "sh":
      return "shell";
    case "cs":
      return "csharp";
    case "py":
      return "python";
    case "yml":
      return "yaml";
    default:
      return extension;
  }
}

export function get3DLoader(extension: string) {
  switch (extension) {
    case "fbx":
      return FBXLoader;
    case "gltf":
      return GLTFLoader;
    case "glb":
      return GLTFLoader;
    case "obj":
      return OBJLoader;
    case "stl":
      return STLLoader;
    default:
      return null;
  }
}
