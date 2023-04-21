import { MdWarning } from "react-icons/md";

type Props = {
  message?: string;
  useContainer?: boolean;
};

export default function ErrorFeedback({ message, useContainer = true }: Props) {
  return (
    <>
      {useContainer ? (
        <div className='card w-full'>
          <div className='fillCard flex w-full items-center justify-center gap-2'>
            <MdWarning className={"text-red-500 dark:text-red-400"} /> Error -{" "}
            {message || "Something went wrong"}
          </div>
        </div>
      ) : (
        <div className='fillCard flex w-full items-center justify-center gap-2'>
          <MdWarning className={"text-red-500 dark:text-red-400"} /> Error -{" "}
          {message || "Something went wrong"}
        </div>
      )}
    </>
  );
}
