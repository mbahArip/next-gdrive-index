export function durationToReadable(
  durationMillis: number,
): string {
  const duration = durationMillis / 1000;
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  const hStr =
    hours > 0
      ? `${hours.toString().padStart(2, "0")}:`
      : "";
  const mStr =
    minutes > 0
      ? `${minutes.toString().padStart(2, "0")}:`
      : "";
  const sStr =
    seconds > 0
      ? `${seconds.toString().padStart(2, "0")}`
      : "00";

  return `${hStr}${mStr}${sStr}`;
}
