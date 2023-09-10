interface ErrorPreviewProps {
  error?: string;
}
export default function ErrorPreview(props: ErrorPreviewProps) {
  return (
    <div className='w-full h-auto min-h-[25vh] flex items-center justify-center flex-col'>
      <h2 className='text-2xl font-bold'>Failed to load file preview</h2>
      <span className='text-sm tablet:text-base text-primary-300 my-2 text-center'>
        Error has been occured while loading preview, it may be caused by{" "}
        <span className='font-medium underline'>invalid file type</span> or{" "}
        <span className='font-medium underline'>network error</span>.
        <br />
        You can try again later or download the file to view.
      </span>

      {props.error && (
        <>
          <span className='font-medium underline'>Error details</span>
          <span className='text-sm tablet:text-base text-primary-300 my-2'>{props.error}</span>
        </>
      )}
    </div>
  );
}
