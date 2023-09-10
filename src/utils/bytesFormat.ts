export default function bytesToReadable(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i]
  );
}
