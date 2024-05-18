export function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;

  const afterClick = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      removeEventListener("click", afterClick);
      anchor.remove();
    }, 100);
  };
  anchor.addEventListener("click", afterClick);

  anchor.click();
}
