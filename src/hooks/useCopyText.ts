import { toast } from "react-toastify";

export default function useCopyText() {
  return (text: string) => {
    if (!navigator.clipboard) {
      toast.error("Your browser does not support copying to clipboard.");
      return;
    }
    if (!text) {
      toast.error("No text to copy.");
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard.");
      })
      .catch(() => {
        toast.error("Could not copy to clipboard.");
      });
  };
}
