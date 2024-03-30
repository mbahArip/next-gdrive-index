import { icons } from "lucide-react";

type FileTypes =
  | "image"
  | "video"
  | "audio"
  | "markdown"
  | "pdf"
  | "document"
  | "code"
  | "text"
  | "manga"
  | "executable";
const extensionsMap: Record<FileTypes, string[]> = {
  image: ["png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "bmp", "avif"],
  video: [
    "mp4",
    "mkv",
    "webm",
    "avi",
    "mov",
    "flv",
    "wmv",
    "mpg",
    "mpeg",
    "m4v",
    "3gp",
  ],
  audio: ["mp3", "ogg", "wav", "flac", "m4a", "wma", "aac"],
  markdown: ["md"],
  pdf: ["pdf"],
  document: ["doc", "docx", "xls", "xlsx", "ppt", "pptx"],
  executable: ["exe", "msi"],
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

// const previewMap: Record<FileTypes | "unknown", (props: PreviewProps) => JSX.Element> = {
//   image: ImagePreview,
//   audio: AudioPreview,
//   video: VideoPreview,
//   markdown: RichPreview,
//   pdf: DocumentPreview,
//   document: DocumentPreview,
//   code: CodePreview,
//   text: CodePreview,
//   manga: MangaPreview,
//   unknown: UnknownPreview,
// };
const iconMap: Record<FileTypes | "unknown", keyof typeof icons> = {
  image: "Image",
  audio: "Music",
  video: "Video",
  markdown: "FileType",
  pdf: "FileText",
  document: "FileSpreadsheet",
  code: "Code",
  executable: "AppWindow",
  text: "Text",
  manga: "BookText",
  unknown: "File",
};

// export function getPreviewComponent(fileExtension: string, mimeType: string) {
//   if (fileExtension === "ts") {
//     if (mimeType.includes("video")) {
//       return previewMap["video"];
//     } else {
//       return previewMap["code"];
//     }
//   }
//   const type = Object.keys(extensionsMap).find((key) =>
//     extensionsMap[key as keyof typeof extensionsMap].includes(fileExtension),
//   );
//   return previewMap[type as keyof typeof previewMap] ?? previewMap["unknown"];
// }

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
