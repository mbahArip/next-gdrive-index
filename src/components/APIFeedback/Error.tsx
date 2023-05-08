import { MdWarning } from "react-icons/md";

type Props = {
  message?: string;
};

export default function ErrorFeedback({ message }: Props) {
  const errorMessage: string = `An error occurred while processing your request.
Please check the following details and try again:`;

  return (
    <div className={"flex w-full flex-col"}>
      <div
        className={
          "mx-auto mb-2 flex items-center justify-center gap-4 max-tablet:flex-col"
        }
      >
        <MdWarning className={"h-8 w-8 text-red-500 dark:text-red-400"} />
        <p className={"text-start"}>{errorMessage}</p>
      </div>

      <div className={"divider-horizontal mx-auto max-w-screen-md"} />
      <div
        className={
          "mx-auto mt-2 flex w-full flex-col items-start justify-center"
        }
      >
        <span>Error details:</span>
        <pre className={"w-full py-2"}>
          <code className={"whitespace-pre-wrap"}>
            {message || "Internal server error"}
          </code>
        </pre>
      </div>
    </div>
  );
}
