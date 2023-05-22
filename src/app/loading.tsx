function RootLoading() {
  return (
    <div
      className={
        "mx-auto flex h-full w-full max-w-screen-xl flex-col gap-2"
      }
    >
      <div
        className={
          "flex h-6 w-full items-center justify-between gap-2 tablet:gap-4"
        }
      >
        <div
          className={
            "skeleton mr-auto h-full w-24 py-1 tablet:w-32"
          }
        />
        <div
          className={
            "skeleton h-full w-24 py-1 tablet:w-32"
          }
        />
      </div>
      <div
        className={
          "skeleton h-full min-h-[50dvh] w-full rounded-lg px-4 py-2"
        }
      ></div>
    </div>
  );
}

export default RootLoading;
