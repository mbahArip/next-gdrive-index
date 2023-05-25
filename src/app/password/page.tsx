import { Metadata } from "next";
import { redirect } from "next/navigation";

import CompPassword from "components/compPassword";

import apiConfig from "config/api.config";
import siteConfig from "config/site.config";

type Props = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export const metadata: Metadata = {
  metadataBase: new URL(apiConfig.basePath),
  title: siteConfig.siteName,
  description: siteConfig.siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
    url: `/`,
    siteName: siteConfig.siteName,
  },
  twitter: {
    title: siteConfig.siteName,
    description: siteConfig.siteDescription,
    card: "summary_large_image",
    site: siteConfig.siteName,
  },
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
