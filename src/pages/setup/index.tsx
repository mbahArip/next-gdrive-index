import Link from "next/link";

export default function Setup() {
  return (
    <div className={"mx-auto flex max-w-screen-xl flex-col gap-4"}>
      <div className={"card"}>
        <div className='flex w-full items-center justify-between rounded-lg px-4'>
          <span className='font-bold'>Starting configuration</span>
        </div>

        <div className={"divider-horizontal"} />

        <p className={"mx-auto max-w-screen-md px-4 py-4 text-center"}>
          This page will guide you through the initial configuration for
          deploying guDora-index. It start from setting up your encryption key,
          Google cloud, and setting up the project.
          <br />
          <br />
          This step will take you couple of minutes. So please read the
          instructions and follow them carefully.
        </p>

        <div className={"divider-horizontal"} />

        <div
          className={
            "mx-auto flex w-full flex-row items-center justify-end gap-2 tablet:gap-4"
          }
        >
          <Link href={"/setup/encryption"}>
            <button className={"primary"}>Start</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
