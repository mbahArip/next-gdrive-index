import AudioPreview from "components/Preview/Audio";
import CodePreview from "components/Preview/Code";
import DocumentPreview from "components/Preview/Document";
import ImagePreview from "components/Preview/Image";
import MangaPreview from "components/Preview/Manga";
import RichPreview from "components/Preview/Rich";
import UnknownPreview from "components/Preview/Unknown";
import VideoPreview from "components/Preview/Video";

import { PreviewProps } from "types/api/files";

type FileTypes = "image" | "video" | "audio" | "markdown" | "pdf" | "document" | "code" | "text" | "manga";
const extensionsMap: Record<FileTypes, string[]> = {
  image: ["png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "bmp", "avif"],
  video: ["mp4", "mkv", "webm", "avi", "mov", "flv", "wmv", "mpg", "mpeg", "m4v", "3gp"],
  audio: ["mp3", "ogg", "wav", "flac", "m4a", "wma", "aac"],
  markdown: ["md"],
  pdf: ["pdf"],
  document: ["doc", "docx", "xls", "xlsx", "ppt", "pptx"],
  code: [
    "html",
    "css",
    "js",
    "ts",
    "tsx",
    "jsx",
    "vue",
    "py",
    "php",
    "go",
    "java",
    "c",
    "cpp",
    "h",
    "hpp",
    "cs",
    "swift",
    "kt",
    "vb",
    "rs",
    "rb",
    "pl",
    "sh",
    "sql",
    "json",
    "xml",
    "yml",
    "yaml",
    "toml",
    "ini",
    "cfg",
    "env",
    "lock",
  ],
  text: ["txt"],
  manga: ["cbz"],
};

const previewMap: Record<FileTypes | "unknown", (props: PreviewProps) => JSX.Element> = {
  image: ImagePreview,
  audio: AudioPreview,
  video: VideoPreview,
  markdown: RichPreview,
  pdf: DocumentPreview,
  document: DocumentPreview,
  code: CodePreview,
  text: CodePreview,
  manga: MangaPreview,
  unknown: UnknownPreview,
};
const iconMap: Record<FileTypes | "unknown", string> = {
  image: "ion:image",
  audio: "ion:musical-notes",
  video: "ion:videocam",
  markdown: "ion:document-text",
  pdf: "ion:document-text",
  document: "ion:document-text",
  code: "ion:code-slash",
  text: "ion:document-text",
  manga: "ion:book",
  unknown: "ion:document",
};

export function getPreviewComponent(fileExtension: string, mimeType: string) {
  if (fileExtension === "ts") {
    if (mimeType.includes("video")) {
      return previewMap["video"];
    } else {
      return previewMap["code"];
    }
  }
  const type = Object.keys(extensionsMap).find((key) =>
    extensionsMap[key as keyof typeof extensionsMap].includes(fileExtension),
  );
  return previewMap[type as keyof typeof previewMap] ?? previewMap["unknown"];
}

export function getPreviewIcon(fileExtension: string, mimeType: string) {
  if (fileExtension === "ts") {
    if (mimeType.includes("video")) {
      return iconMap["video"];
    } else {
      return iconMap["code"];
    }
  }
  const type = Object.keys(extensionsMap).find((key) =>
    extensionsMap[key as keyof typeof extensionsMap].includes(fileExtension),
  );
  return iconMap[type as keyof typeof iconMap] ?? iconMap["unknown"];
}
