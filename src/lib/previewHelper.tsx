import { defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import { type icons } from "lucide-react";

import Icon from "~/components/ui/icon";

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

/**
 * File extensions and their corresponding file types
 * Add more file extensions if needed
 */
const extensionsMap: Record<FileTypes, string[]> = {
  image: ["png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "bmp", "avif"],
  video: [
    "mp4",
    "mkv",
    "webm",
    // "avi",
    // "mov",
    // "flv",
    // "wmv",
    "mpg",
    "mpeg",
    "m4v",
    "3gp",
  ],
  audio: ["mp3", "ogg", "wav", "flac", "m4a", "wma", "aac"],
  markdown: ["md"],
  pdf: ["pdf"],
  document: ["odt", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv"],
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

/**
 * Icon for each file type
 * Use icons from lucide
 * https://lucide.dev/icons/
 */
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

/**
 * Get file type based on file extension and mime type
 * @param fileExtension
 * @param mimeType
 * @returns FileTypes or "unknown"
 */
export function getFileType(fileExtension: string, mimeType: string): FileTypes | "unknown" {
  // Handle .ts video file
  if (fileExtension === "ts") {
    if (mimeType.includes("video")) {
      return "video";
    } else {
      return "code";
    }
  }
  const type = Object.keys(extensionsMap).find((key) =>
    extensionsMap[key as keyof typeof extensionsMap].includes(fileExtension),
  );

  return type ? (type as FileTypes) : "unknown";
}

/**
 * Get icon for file preview based on file extension and mime type
 * @param fileExtension
 * @param mimeType
 * @returns Icon component
 */
export function getPreviewIcon(fileExtension: string, mimeType: string) {
  if (fileExtension === "ts") {
    if (mimeType.includes("video")) {
      return iconMap.video;
    } else {
      return iconMap.code;
    }
  }
  const type = Object.keys(extensionsMap).find((key) =>
    extensionsMap[key as keyof typeof extensionsMap].includes(fileExtension),
  );
  return iconMap[type as keyof typeof iconMap] ?? iconMap.unknown;
}

export const MediaPlayerIcons = {
  ...defaultLayoutIcons,
  AirPlayButton: {
    Default: () => (
      <Icon
        hideWrapper
        name='Airplay'
        className='vds-icon size-5'
      />
    ),
    Connecting: () => (
      <Icon
        hideWrapper
        name='LoaderCircle'
        className='vds-icon size-5 animate-spin'
      />
    ),
    Connected: () => (
      <Icon
        hideWrapper
        name='Airplay'
        className='vds-icon size-5'
      />
    ),
  },
  GoogleCastButton: {
    Default: () => (
      <Icon
        hideWrapper
        name='Cast'
        className='vds-icon size-5'
      />
    ),
    Connecting: () => (
      <Icon
        hideWrapper
        name='LoaderCircle'
        className='vds-icon size-5 animate-spin'
      />
    ),
    Connected: () => (
      <Icon
        hideWrapper
        name='Cast'
        className='vds-icon size-5'
      />
    ),
  },
  PlayButton: {
    Play: () => (
      <Icon
        hideWrapper
        name='Play'
        className='vds-icon size-5 fill-current media-ended:hidden media-playing:hidden'
      />
    ),
    Pause: () => (
      <Icon
        hideWrapper
        name='Pause'
        className='vds-icon size-5 fill-current media-paused:hidden'
      />
    ),
    Replay: () => (
      <Icon
        hideWrapper
        name='RotateCcw'
        className='vds-icon hidden size-5 media-ended:block'
      />
    ),
  },
  MuteButton: {
    Mute: () => (
      <Icon
        hideWrapper
        name='VolumeX'
        className='vds-icon mute-icon size-5'
      />
    ),
    VolumeLow: () => (
      <Icon
        hideWrapper
        name='Volume1'
        className='vds-icon volume-low-icon size-5'
      />
    ),
    VolumeHigh: () => (
      <Icon
        hideWrapper
        name='Volume2'
        className='vds-icon volume-high-icon size-5'
      />
    ),
  },
  CaptionButton: {
    On: () => (
      <Icon
        hideWrapper
        name='Captions'
        className='vds-icon size-5'
      />
    ),
    Off: () => (
      <Icon
        hideWrapper
        name='CaptionsOff'
        className='vds-icon size-5'
      />
    ),
  },
  PIPButton: {
    Enter: () => (
      <Icon
        hideWrapper
        name='PictureInPicture'
        className='vds-icon size-5'
      />
    ),
    Exit: () => (
      <Icon
        hideWrapper
        name='X'
        className='vds-icon size-5'
      />
    ),
  },
  FullscreenButton: {
    Enter: () => (
      <Icon
        hideWrapper
        name='Maximize2'
        className='vds-icon size-5'
      />
    ),
    Exit: () => (
      <Icon
        hideWrapper
        name='Minimize2'
        className='vds-icon size-5'
      />
    ),
  },
  SeekButton: {
    Backward: () => (
      <Icon
        hideWrapper
        name='ChevronsLeft'
        className='vds-icon size-5'
      />
    ),
    Forward: () => (
      <Icon
        hideWrapper
        name='ChevronsRight'
        className='vds-icon size-5'
      />
    ),
  },
  DownloadButton: {
    Default: () => (
      <Icon
        hideWrapper
        name='Download'
        className='vds-icon size-5'
      />
    ),
  },
  Menu: {
    Accessibility: () => (
      <Icon
        hideWrapper
        name='PersonStanding'
        className='vds-icon mr-2 size-5'
      />
    ),
    ArrowLeft: () => null,
    ArrowRight: () => (
      <Icon
        hideWrapper
        name='ChevronRight'
        className='vds-icon size-5'
      />
    ),
    Audio: () => (
      <Icon
        hideWrapper
        name='Volume2'
        className='vds-icon mr-2 size-5'
      />
    ),
    AudioBoostUp: () => (
      <Icon
        hideWrapper
        name='Volume2'
        className='vds-icon size-5'
      />
    ),
    AudioBoostDown: () => (
      <Icon
        hideWrapper
        name='Volume'
        className='vds-icon size-5'
      />
    ),
    Chapters: () => (
      <Icon
        hideWrapper
        name='List'
        className='vds-icon size-5'
      />
    ),
    Captions: () => (
      <Icon
        hideWrapper
        name='Captions'
        className='vds-icon size-5'
      />
    ),
    Playback: () => (
      <Icon
        hideWrapper
        name='ListVideo'
        className='size5 mr-2 '
      />
    ),
    Settings: () => (
      <Icon
        hideWrapper
        name='Settings'
        className='vds-icon vds-rotate-icon size-5'
      />
    ),
    SpeedUp: () => (
      <Icon
        hideWrapper
        name='ChevronsUp'
        className='vds-icon size-5'
      />
    ),
    SpeedDown: () => (
      <Icon
        hideWrapper
        name='ChevronsDown'
        className='vds-icon size-5'
      />
    ),
    QualityUp: () => null,
    QualityDown: () => null,
    FontSizeUp: () => null,
    FontSizeDown: () => null,
    OpacityUp: () => null,
    OpacityDown: () => null,
    RadioCheck: () => null,
  },
  KeyboardDisplay: {
    Play: () => (
      <div className='grid h-full w-full place-items-center'>
        <Icon
          hideWrapper
          name='Play'
          className='size-6'
        />
      </div>
    ),
    Pause: () => (
      <div className='grid h-full w-full place-items-center'>
        <Icon
          hideWrapper
          name='Pause'
          className='size-6'
        />
      </div>
    ),
    Mute: () => (
      <div className='grid h-full w-full place-items-center'>
        <Icon
          hideWrapper
          name='VolumeX'
          className='size-6'
        />
      </div>
    ),
    VolumeUp: () => (
      <div className='grid h-full w-full place-items-center'>
        <Icon
          hideWrapper
          name='Volume2'
          className='size-6'
        />
      </div>
    ),
    VolumeDown: () => (
      <div className='grid h-full w-full place-items-center'>
        <Icon
          hideWrapper
          name='Volume1'
          className='size-6'
        />
      </div>
    ),
    EnterFullscreen: () => (
      <div className='grid h-full w-full place-items-center'>
        <Icon
          hideWrapper
          name='Maximize2'
          className='size-6'
        />
      </div>
    ),
    ExitFullscreen: () => (
      <div className='grid h-full w-full place-items-center'>
        <Icon
          hideWrapper
          name='Minimize2'
          className='size-6'
        />
      </div>
    ),
    // EnterPiP: () => null,
    // ExitPiP: () => null,
    CaptionsOn: () => (
      <div className='grid h-full w-full place-items-center'>
        <Icon
          hideWrapper
          name='Captions'
          className='size-6'
        />
      </div>
    ),
    CaptionsOff: () => (
      <div className='grid h-full w-full place-items-center'>
        <Icon
          hideWrapper
          name='CaptionsOff'
          className='size-6'
        />
      </div>
    ),
    SeekForward: () => (
      <div className='grid h-full w-full place-items-center'>
        <Icon
          hideWrapper
          name='ChevronsRight'
          className='size-6'
        />
      </div>
    ),
    SeekBackward: () => (
      <div className='grid h-full w-full place-items-center'>
        <Icon
          hideWrapper
          name='ChevronsLeft'
          className='size-6'
        />
      </div>
    ),
  },
};
