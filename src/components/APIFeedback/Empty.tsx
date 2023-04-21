type Props = {
  message?: string;
};

export default function EmptyFeedback({ message }: Props) {
  return (
    <div className='fillCard flex w-full items-center justify-center gap-2'>
      {message || "Folder is empty"}
    </div>
  );
}
