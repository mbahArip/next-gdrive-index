import { typeGroup } from "utils/fileHelper/fileGroup";

export const extensionMap: Record<string, string> = {
  "fbx": typeGroup["3d"],
  "obj": typeGroup["3d"],
  "stl": typeGroup["3d"],
  "gltf": typeGroup["3d"],
  "glb": typeGroup["3d"],

  "flac": typeGroup.audio,
  "m4a": typeGroup.audio,
  "mp3": typeGroup.audio,
  "ogg": typeGroup.audio, // Check for audio or video
  "wav": typeGroup.audio,

  "7z": typeGroup.archive,
  "bz2": typeGroup.archive,
  "gz": typeGroup.archive,
  "rar": typeGroup.archive,
  "tar": typeGroup.archive,
  "zip": typeGroup.archive,

  "md": typeGroup.rich_text,
  "txt": typeGroup.text,
  "pdf": typeGroup.pdf,

  "doc": typeGroup.officeWord,
  "docx": typeGroup.officeWord,
  "xls": typeGroup.officeExcel,
  "xlsx": typeGroup.officeExcel,
  "ppt": typeGroup.officePowerPoint,
  "pptx": typeGroup.officePowerPoint,

  "db": typeGroup.database,
  "dbf": typeGroup.database,
  "mdb": typeGroup.database,
  "pdb": typeGroup.database,
  "sql": typeGroup.database,
  "csv": typeGroup.database,
  "tsv": typeGroup.database,

  "bmp": typeGroup.image,
  "gif": typeGroup.image,
  "jpg": typeGroup.image,
  "jpeg": typeGroup.image,
  "png": typeGroup.image,
  "svg": typeGroup.image,
  "webp": typeGroup.image,

  "c": typeGroup.code,
  "cpp": typeGroup.code,
  "cs": typeGroup.code,
  "css": typeGroup.code,
  "go": typeGroup.code,
  "h": typeGroup.code,
  "html": typeGroup.code,
  "ini": typeGroup.code,
  "java": typeGroup.code,
  "js": typeGroup.code,
  "json": typeGroup.code,
  "jsx": typeGroup.code,
  "php": typeGroup.code,
  "py": typeGroup.code,
  "rb": typeGroup.code,
  "rs": typeGroup.code,
  "rust": typeGroup.code,
  "sass": typeGroup.code,
  "scss": typeGroup.code,
  "sh": typeGroup.code,
  "swift": typeGroup.code,
  "ts": typeGroup.code,
  "tsx": typeGroup.code,
  "xml": typeGroup.code,
  "yaml": typeGroup.code,
  "vue": typeGroup.code,
  "toml": typeGroup.code,

  "mp4": typeGroup.video,
  "webm": typeGroup.video,
  "3gp": typeGroup.video,
  "mpeg": typeGroup.video,
  "mpg": typeGroup.video,
  "ogg-vid": typeGroup.video,
  "ts-vid": typeGroup.video,
  "mov": typeGroup.video,
  "mkv": typeGroup.video,

  "woff": typeGroup.font,
  "woff2": typeGroup.font,
  "ttf": typeGroup.font,
  "otf": typeGroup.font,

  "dat": typeGroup.binary,
  "bin": typeGroup.binary,
  "exe": typeGroup.binary,
  "dll": typeGroup.binary,
  "msi": typeGroup.binary,
};
export const overlapVideo = ["ogg", "ts"];

function getFileGroup(
  extension: string,
  mimeType?: string,
): keyof typeof typeGroup {
  if (overlapVideo.includes(extension)) {
    const isVideo = !!mimeType?.startsWith("video");
    if (isVideo) {
      return "video";
    }
  }

  if (mimeType) {
    const group = mimeType.split("/")[0];
    if (group in typeGroup) {
      return group as keyof typeof typeGroup;
    }
  }

  const group = extensionMap[
    extension
  ] as keyof typeof typeGroup;

  return typeGroup[group] ? group : "default";
}

export default getFileGroup;
