import Link from "next/link";
import LoadingFeedback from "components/APIFeedback/Loading";
import MarkdownRender from "components/utility/MarkdownRender";
import useLocalStorage from "hooks/useLocalStorage";
import { useEffect, useState } from "react";

type ConfigProps = {
  client_id: string;
  client_secret: string;
  refresh_token: string;
};
const defaultConfig: ConfigProps = {
  client_id: "",
  client_secret: "",
  refresh_token: "",
};

export default function SetupFinal() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tempKey] = useLocalStorage("tempEncryption", "");
  const [tempConfig] = useLocalStorage<ConfigProps>(
    "tempGoogleCloud",
    defaultConfig,
  );
  const [dataConfig, setDataConfig] = useState<ConfigProps>(defaultConfig);
  const [dataKey, setDataKey] = useState<string>("");
  const [mdContent, setMdContent] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);
    if (tempConfig) {
      setDataConfig(tempConfig);
    }
    if (tempKey) {
      setDataKey(tempKey);
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const mdContent = `To finishing the setup, you need to do the following steps:

## API Config
The API Config file are located at \`src/config/api.ts\`. You need to fill in the following information:
\`\`\`js
module.exports = {
    client_id: "${dataConfig.client_id}",
    client_secret: "${dataConfig.client_secret}",
    refresh_token: "${dataConfig.refresh_token}",
}
\`\`\`

## Environment Config
The environment variables are differ for each hosting service. If you are using Vercel, you can add the environment variables on the project settings page.
\`\`\`
ENCRYPTION_KEY="${dataKey}"
\`\`\`

**NOTE:** Make sure to redeploy the site after adding the environment variables.

## Customizing the Site
The site can be customized by editing the \`src/config/site.ts\` file. You can change the site title, description, and other information.  
All the explanation also included in the file.`;

    setMdContent(mdContent);
    setIsLoading(false);

    //   Remove the temp data
    localStorage.removeItem("tempEncryption");
    localStorage.removeItem("tempGoogleCloud");
  }, [dataConfig, dataKey]);

  return (
    <div className={"mx-auto flex max-w-screen-xl flex-col gap-4"}>
      <div className={"card"}>
        <div className='flex w-full items-center justify-between rounded-lg px-4'>
          <span className='font-bold'>Finishing setup</span>
        </div>

        <div className={"divider-horizontal"} />

        {isLoading ? (
          <LoadingFeedback message={"Loading data..."} />
        ) : (
          <MarkdownRender content={mdContent} />
        )}

        <div className={"divider-horizontal"} />

        <div
          className={
            "mx-auto flex w-full flex-row items-center justify-end gap-2 tablet:gap-4"
          }
        >
          <Link href={"/"}>
            <button className={"primary"}>Finish</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
