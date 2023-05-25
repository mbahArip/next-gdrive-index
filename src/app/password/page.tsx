import { redirect } from "next/navigation";

import CompPassword from "components/compPassword";

type Props = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};
function Password({ searchParams }: Props) {
  if (
    searchParams["redirect"] === undefined ||
    searchParams["path"] === undefined
  ) {
    redirect("/");
  }

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

      <CompPassword
        path={searchParams["path"] as string}
        redirect={searchParams["redirect"] as string}
      />
    </div>
  );
}

export default Password;
