import { MdWarning } from "react-icons/md";

type Props = {
  message?: string;
};

export default function ErrorFeedback({ message }: Props) {
  const errorMessage: string = `An error occurred while processing your request.
Please check the following details and try again:`;

  return (
    <div className={"flex flex-col"}>
      <div className={"mx-auto flex items-center justify-center gap-4"}>
        <MdWarning className={"h-8 w-8 text-red-500 dark:text-red-400"} />
        <p className={"text-start"}>{errorMessage}</p>
      </div>

      <div className={"divider-horizontal"} />
      <div
        className={
          "mx-auto flex w-full max-w-[50%] flex-col items-start justify-center"
        }
      >
        <span>Error details:</span>
        <pre className={"w-full py-2"}>
          <code>{message || "Internal server error"}</code>
        </pre>
      </div>
    </div>
  );
}
