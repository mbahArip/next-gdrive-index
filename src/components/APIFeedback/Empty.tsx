type Props = {
  message?: string;
};

export default function EmptyFeedback({ message }: Props) {
  return (
    <div className={"flex flex-col"}>
      <div className={"mx-auto flex items-center justify-center gap-4"}>
        <span>{message || "Folder is empty"}</span>
      </div>
    </div>
  );
}
