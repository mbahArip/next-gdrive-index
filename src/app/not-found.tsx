import Link from "next/link";

function NotFound() {
  return (
    <div
      className={
        "relative flex h-full min-h-[80dvh] w-full flex-grow flex-col items-center justify-center gap-8"
      }
    >
      {/* Image placeholder */}
      <div
        className={
          "grid h-48 w-48 place-items-center rounded-lg bg-blue-300 font-semibold text-zinc-900"
        }
      >
        Placeholder Image
      </div>

      <div
        className={
          "flex max-w-screen-lg flex-col items-center gap-2"
        }
      >
        <h1 className={"font-semibold"}>
          Error 404: Not Found
        </h1>
        <p className={"font-medium"}>
          The file or folder you are trying to access does
          not exist or has been deleted.
        </p>
        <Link href={"/"}>
          <button>Go back to home</button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
