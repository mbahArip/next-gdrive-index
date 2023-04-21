import { MdContentCopy } from "react-icons/md";
import { useState } from "react";
import { generateRandomEncryptionKey } from "@utils/encryptionHelper";
import useCopyText from "@hooks/useCopyText";
import { toast } from "react-toastify";

export default function Setup() {
  const [key, setKey] = useState<string>("");
  const copyText = useCopyText();

  return (
    <div className='mx-auto flex max-w-screen-xl flex-col gap-4'>
      <div className={"card"}>
        <div className='flex w-full items-center justify-between rounded-lg px-4'>
          <span className='font-bold'>Generate random encryption key</span>
        </div>

        <div className={"divider-horizontal"} />

        <p className={"mx-auto max-w-screen-md px-4 py-4 text-center"}>
          On this page you can generate a random encryption key.
          <br />
          This key will be used to encrypt your files.
          <br />
          You can also copy the key to your clipboard and save it somewhere
          safe.
        </p>

        <div
          className={"mx-auto flex w-full max-w-screen-md flex-col gap-2 px-4"}
        >
          <div className={"flex flex-col gap-2"}>
            <span className='font-bold'>Encryption key</span>
            <input
              type={"text"}
              disabled
              className={"pr-4"}
              value={key}
            />
          </div>
          <div
            className={
              "mx-auto mt-4 flex w-full max-w-md flex-col items-center justify-center gap-2 tablet:flex-row tablet:gap-4"
            }
          >
            <button
              className={"flex w-full items-center justify-center"}
              onClick={(e) => {
                e.preventDefault();

                const generated = generateRandomEncryptionKey()
                  .then((key) => {
                    setKey(key);
                  })
                  .catch((err) => {
                    toast.error("Failed to generate encryption key");
                    console.error(err);
                  });
              }}
            >
              Generate
            </button>
            <button
              className={"flex w-full items-center justify-center"}
              onClick={(e) => {
                e.preventDefault();
                copyText(key);
              }}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
