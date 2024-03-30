import gIndexConfig from "config";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link
          rel='icon'
          href={gIndexConfig.siteConfig.favIcon}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
