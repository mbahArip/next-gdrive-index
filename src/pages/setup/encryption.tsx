import { MdWarning } from "react-icons/md";
import { useEffect, useState } from "react";
import {
  createEncryptionKey,
  generateRandomEncryptionKey,
} from "utils/encryptionHelper";
import useCopyText from "hooks/useCopyText";
import { toast } from "react-toastify";
import Link from "next/link";
import useLocalStorage from "hooks/useLocalStorage";

export default function Encryption() {
  const [settingJson, setSettingJson] = useLocalStorage("tempEncryption", "");
  const [key, setKey] = useState<string>("");
  const [allowNext, setAllowNext] = useState<boolean>(false);
  const copyText = useCopyText();

  useEffect(() => {
    if (settingJson) {
      setKey(settingJson);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (key) {
      setAllowNext(true);
    } else {
      setAllowNext(false);
    }
  }, [key]);

  return (
    <div className='mx-auto flex max-w-screen-xl flex-col gap-4'>
      <div className={"card"}>
        <div className='flex w-full items-center justify-between rounded-lg px-4'>
          <span className='font-bold'>Encryption key</span>
        </div>

        <div className={"divider-horizontal"} />

        <div className={"banner warning"}>
          <MdWarning className={"h-6 w-6 text-red-500"} />
          <span>
            Make sure you don&apos;t share your encryption key with anyone.
          </span>
        </div>

        <p className={"mx-auto max-w-screen-md px-4 py-4 text-center"}>
          On this page you can generate a random encryption key, or you can
          define your own.
          <br />
          This key will be used to encrypt your files.
          <br />
          <br />
          You can also copy the key to your clipboard and save it somewhere
          safe.
        </p>

        <div
          className={"mx-auto flex w-full max-w-screen-md flex-col gap-4 px-4"}
        >
          <div className={"flex flex-col gap-2"}>
            <span className='font-bold'>Encryption key</span>
            <input
              type={"text"}
              className={"pr-4"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={"Enter your encryption key here..."}
            />
          </div>
          <div className={"mx-auto grid w-full max-w-md grid-cols-2 gap-2"}>
            <button
              className={"primary flex w-full items-center justify-center"}
              onClick={(e) => {
                e.preventDefault();

                generateRandomEncryptionKey()
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
              className={"danger flex w-full items-center justify-center"}
              onClick={(e) => {
                e.preventDefault();

                setKey("");
              }}
            >
              Reset
            </button>
            <button
              className={
                "secondary col-span-full flex w-full items-center justify-center"
              }
              onClick={(e) => {
                e.preventDefault();
                copyText(key);
              }}
            >
              Copy
            </button>
          </div>
        </div>

        <div className={"divider-horizontal"} />

        <div
          className={
            "mx-auto flex w-full items-center justify-end gap-2 tablet:gap-4"
          }
        >
          <Link href={"/setup"}>
            <button className={"secondary"}>Previous Page</button>
          </Link>
          <Link
            href={allowNext ? "/setup/google-cloud" : ""}
            onClick={async () => {
              if (!allowNext) return;
              if (!key) return;
              createEncryptionKey(key).then((encryptionKey) => {
                setSettingJson(encryptionKey);
              });
            }}
          >
            <button
              className={"primary"}
              disabled={!allowNext}
            >
              Next Page
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
