import ReactLoading from "react-loading";

type Props = {
  message?: string;
};

export default function LoadingFeedback({ message }: Props) {
  return (
    <div className={"flex flex-col"}>
      <div className={"mx-auto flex items-center justify-center gap-4"}>
        <ReactLoading
          type='spin'
          width={20}
          height={20}
          className={"loading"}
        />
        <span>{message || "Loading..."}</span>
      </div>
    </div>
  );
}
