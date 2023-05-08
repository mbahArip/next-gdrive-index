import { ReactNode } from "react";
import Breadcrumb from "components/Breadcrumb";
import SwitchLayout from "components/utility/SwitchLayout";
import useSWR from "swr";
import fetcher from "utils/swrFetch";
import { BreadCrumbsResponse } from "types/googleapis";

type Props = {
  children: ReactNode;
  fileId: string;
  renderSwitchLayout?: boolean;
};

export default function DefaultLayout({
  children,
  fileId,
  renderSwitchLayout = true,
}: Props) {
  const { data, isLoading } = useSWR<BreadCrumbsResponse>(
    `/api/files/${fileId}/getPath`,
    fetcher,
  );

  return (
    <div className={"mx-auto flex max-w-screen-xl flex-col gap-2"}>
      <div className={"flex w-full items-center justify-between gap-2"}>
        <Breadcrumb
          data={fileId === "root" ? undefined : data}
          isLoading={isLoading}
        />
        {renderSwitchLayout && <SwitchLayout />}
      </div>

      {children}
    </div>
  );
}
