import { type Metadata } from "next";

import { DeployPage } from "~/components/internal";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Deploying Guide",
  description: "Read on how to deploy your own index instance",
};

export default function InternalDeployPage() {
  return <DeployPage />;
}
