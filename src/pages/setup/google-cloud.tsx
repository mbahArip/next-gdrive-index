import { useEffect, useState } from "react";
import { encrypt } from "@utils/encryptionHelper";
import Link from "next/link";
import useLocalStorage from "@hooks/useLocalStorage";
import MarkdownRender from "@components/utility/MarkdownRender";
import useSWR from "swr";
import fetcher from "@utils/swrFetch";
import LoadingFeedback from "@components/APIFeedback/Loading";

export default function SetupGoogleCloud() {
  const [encryptionKey] = useLocalStorage("tempEncryption", "");
  const [_settingJson, setSettingJson] = useLocalStorage("tempGoogleCloud", {
    client_id: "",
    client_secret: "",
    refresh_token: "",
  });
  const [client_id, setClientID] = useState<string>("");
  const [client_secret, setClientSecret] = useState<string>("");
  const [refresh_token, setRefreshToken] = useState<string>("");
  const [allowNext, setAllowNext] = useState<boolean>(false);

  const { data, isLoading } = useSWR("/setup/GoogleCloudStep.md", fetcher);

  useEffect(() => {
    if (client_id && client_secret && refresh_token) {
      setAllowNext(true);
    } else {
      setAllowNext(false);
    }
  }, [client_id, client_secret, refresh_token]);

  return (
    <div className='mx-auto flex max-w-screen-xl flex-col gap-4'>
      <div className={"card"}>
        <div className='flex w-full items-center justify-between rounded-lg px-4'>
          <span className='font-bold'>Setting up Google Cloud</span>
        </div>

        <div className={"divider-horizontal"} />

        <div className={"banner"}>
          <span>
            If you already have Client ID, Client Secret, and Refresh Token.
            Click <a href={"#skip"}>here</a> to skip this step.
          </span>
        </div>

        <div
          className={"mx-auto flex w-full max-w-screen-md flex-col gap-4 px-4"}
        >
          <div className={"flex flex-col gap-2"}>
            {isLoading ? (
              <LoadingFeedback message={"Loading file..."} />
            ) : (
              <MarkdownRender content={data as string} />
            )}
          </div>
        </div>
      </div>

      <div
        className={"card"}
        id={"skip"}
      >
        <div className='flex w-full items-center justify-between rounded-lg px-4'>
          <span className='font-bold'>Store Google Cloud credentials</span>
        </div>
        <div className={"divider-horizontal"} />
        <div
          className={"mx-auto flex w-full max-w-screen-md flex-col gap-4 px-4"}
        >
          <div className={"flex flex-col gap-2"}>
            <span className='font-bold'>Client ID</span>
            <input
              type={"text"}
              className={"pr-4"}
              value={client_id}
              onChange={(e) => setClientID(e.target.value)}
              placeholder={"Enter your client id here..."}
            />
          </div>
          <div className={"flex flex-col gap-2"}>
            <span className='font-bold'>Client Secret</span>
            <input
              type={"text"}
              className={"pr-4"}
              value={client_secret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder={"Enter your client secret here..."}
            />
            <span className={"text-xs tablet:text-sm"}>
              * Client secret will be encrypted using your encryption key
            </span>
          </div>
          <div className={"flex flex-col gap-2"}>
            <span className='font-bold'>Refresh Token</span>
            <input
              type={"text"}
              className={"pr-4"}
              value={refresh_token}
              onChange={(e) => setRefreshToken(e.target.value)}
              placeholder={"Enter your refresh token here..."}
            />
            <span className={"text-xs tablet:text-sm"}>
              * Refresh token will be encrypted using your encryption key
            </span>
          </div>
        </div>

        <div className={"divider-horizontal"} />

        <div
          className={
            "mx-auto flex w-full items-center justify-end gap-2 tablet:gap-4"
          }
        >
          <Link href={"/setup/encryption"}>
            <button className={"secondary"}>Previous Page</button>
          </Link>
          <Link
            href={allowNext ? "/setup/final" : ""}
            onClick={() => {
              if (!allowNext) return;
              setSettingJson({
                client_id,
                client_secret: encrypt(client_secret, encryptionKey),
                refresh_token: encrypt(refresh_token, encryptionKey),
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
