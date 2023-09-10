export default function UnknownPreview() {
  return (
    <div className='w-full h-auto min-h-[25vh] flex items-center justify-center flex-col'>
      <h2 className='text-2xl font-bold'>File preview not available</h2>
      <span className='text-sm tablet:text-base text-primary-300 my-2 text-center'>
        This file type is not supported for preview.
        <br />
        You can download the file to view.
      </span>
    </div>
  );
}
