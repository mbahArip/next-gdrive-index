function formatDuration(milliseconds: string | number) {
  let ms: number = milliseconds as number;
  if (typeof milliseconds === "string") {
    ms = Number(milliseconds);
  }

  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const hourString = hours > 0 ? `${hours}:` : "";
  const minuteString =
    minutes > 0
      ? `${String(minutes).padStart(2, "0")}:`
      : "00:";
  const secondString =
    seconds > 0 ? String(seconds).padStart(2, "0") : "00";

  return `${hourString}${minuteString}${secondString}`;
}

export default formatDuration;
