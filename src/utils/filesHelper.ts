export function stripExtension(
  filename: string,
  ext: string,
): string {
  // Make sure the extension is lowercase and also remove the dot
  const extension = ext.toLowerCase().replace(/^\./, "");
  return filename.toLowerCase().endsWith(extension)
    ? filename.slice(0, -extension.length - 1)
    : filename;
}
