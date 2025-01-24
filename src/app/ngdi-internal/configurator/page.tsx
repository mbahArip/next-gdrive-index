import { type Metadata } from "next";

import { ConfiguratorPage } from "~/components/internal";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Configurator",
  description: "Generate configuration file for your index",
};

export default function InternalConfiguratorPage() {
  return <ConfiguratorPage />;
}
