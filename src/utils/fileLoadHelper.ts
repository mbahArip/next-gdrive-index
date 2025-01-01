import { toast } from "sonner";

type Props = {
  accept: string;
  fileName?: string;
  onLoad: (result: string) => void;
};
export function fileLoadHelper({ accept, fileName, onLoad }: Props) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = accept;
  fileInput.onchange = async (fileEvent) => {
    const file = (fileEvent.target as HTMLInputElement).files?.[0];
    if (!file) return toast.error("No file selected.");

    if (fileName) {
      const filename = file.name;
      if (filename.toLocaleLowerCase() !== fileName.toLocaleLowerCase()) {
        return toast.error(`Invalid file selected. Expected ${fileName}.`);
      }
    }

    const reader = new FileReader();
    reader.onload = async (readerEvent) => {
      const result = readerEvent.target?.result as string;
      if (!result) return toast.error("Failed to read file.");

      onLoad(result);

      fileInput.value = "";
    };
    reader.onloadend = () => {
      fileInput.remove();
    };

    reader.readAsText(file);
  };
  fileInput.click();
  fileInput.remove();
}
