import ReactLoading from "react-loading";

type Props = {
  message?: string;
  useContainer?: boolean;
};

export default function LoadingFeedback({
  message,
  useContainer = true,
}: Props) {
  return (
    <>
      {useContainer ? (
        <div className='card w-full'>
          <div className='fillCard flex w-full items-center justify-center gap-2'>
            <ReactLoading
              type='spin'
              width={20}
              height={20}
              className={"loading"}
            />{" "}
            {message || "Loading..."}
          </div>
        </div>
      ) : (
        <div className='fillCard flex w-full items-center justify-center gap-2'>
          <ReactLoading
            type='spin'
            width={20}
            height={20}
            className={"loading"}
          />{" "}
          {message || "Loading..."}
        </div>
      )}
    </>
  );
}
