import { type Metadata } from "next";

import { Status } from "~/components/global";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Reserved Internal Path",
  description: "This path is preserved for all internal pages, make sure you don't use this path on your google drive",
};

export default async function InternalRootPage() {
  return (
    <div className='grid grow place-items-center'>
      <Status
        icon='Lock'
        message="This path is preserved for all internal pages, make sure you don't use this path on your google drive"
      />
    </div>
  );
}
