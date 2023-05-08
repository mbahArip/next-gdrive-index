// Get locale from browser
export function getLocale() {
  if (typeof window === "undefined") return "en-US";
  if (window.navigator.languages) return window.navigator.languages[0];
  return window.navigator.language;
}

export function formatDuration(milliseconds: string | number) {
  let ms: number = milliseconds as number;
  if (typeof milliseconds === "string") {
    ms = parseInt(milliseconds);
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hourString = hours > 0 ? `${hours}:` : "";
  const minuteString =
    minutes > 0 ? `${String(minutes).padStart(2, "0")}:` : "00:";
  const secondString = seconds > 0 ? String(seconds).padStart(2, "0") : "00";

  return `${hourString}${minuteString}${secondString}`;
}

export function formatBytes(bytes: number | string) {
  let b: number = typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (b === 0) return "0 Bytes";

  const k = 1024;
  const dm = 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(b) / Math.log(k));

  return parseFloat((b / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(date: Date, locale = getLocale()) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(date);
}

type RelativeTimeFormatUnit =
  | "year"
  | "quarter"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second";
export function formatRelativeDate(
  date: Date,
  unit: RelativeTimeFormatUnit = "day",
  locale = getLocale(),
) {
  const currentDate = Date.now();
  let diff = (date.getTime() - currentDate) / (1000 * 60 * 60 * 24);

  // if negative, round up, else round down
  if (diff < 0) {
    diff = Math.ceil(diff);
  } else {
    diff = Math.floor(diff);
  }

  return new Intl.RelativeTimeFormat(locale, {
    localeMatcher: "best fit",
    numeric: "auto",
    style: "long",
  }).format(diff, unit);
}

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
