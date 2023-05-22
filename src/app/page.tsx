import SwitchLayout from "./compSwitchLayout";
import Breadcrumb from "./compBreadcrumb";
import trigger from "./trigger";
import FileLayout from "./compFileLayout";
import fetch from "utils/generalHelper/fetch";
import { API_Response } from "types/api";
import { FilesResponse } from "types/api/files";

async function RootPage() {
  const { data: filesData } = await fetch.get<
    API_Response<FilesResponse>
  >("/api/files");

  return (
    <div
      className={
        "mx-auto flex h-full w-auto max-w-screen-xl flex-col gap-2"
      }
    >
      <div
        id={"content-head"}
        className={
          "flex w-full items-center justify-between gap-2 tablet:gap-4"
        }
      >
        <Breadcrumb />
        <SwitchLayout />
      </div>

      <div
        id={"content-files"}
        className={"card"}
      >
        <FileLayout
          data={
            filesData.data
              ? filesData.data
              : { folders: [], files: [] }
          }
        />
      </div>
    </div>
  );
}

export default RootPage;
