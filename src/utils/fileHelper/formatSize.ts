function formatSize(bytes: number | string) {
  let b: number =
    typeof bytes === "string" ? parseInt(bytes) : bytes;
  if (b === 0) return "0 Bytes";

  const k = 1024;
  const dm = 2;
  const sizes = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
    "PB",
    "EB",
    "ZB",
    "YB",
  ];
  const i = Math.floor(Math.log(b) / Math.log(k));

  return (
    parseFloat((b / Math.pow(k, i)).toFixed(dm)) +
    " " +
    sizes[i]
  );
}

export default formatSize;
