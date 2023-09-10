import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import gIndexConfig from "config";

import { generatedDownloadLink } from "utils/generateDownloadLink";

import { PreviewProps } from "types/api/files";

import ErrorPreview from "./Error";

function LoadingRender() {
  return (
    <div className='w-full h-auto min-h-[50vh] flex items-center justify-center'>
      <div className='flex flex-col gap-4 items-center justify-center animate-pulse'>
        <div className='w-fit h-fit relative grid place-items-center'>
          <img
            src={gIndexConfig.siteConfig.siteIcon}
            alt={gIndexConfig.siteConfig.siteName}
            className='w-12 -top-1 relative'
          />
          <div className='absolute w-12 h-12 bg-transparent border border-primary-50 rounded-full animate-ping' />
        </div>
        <span>Loading content...</span>
      </div>
    </div>
  );
}
function ErrorRender() {
  return <ErrorPreview />;
}

export default function DocumentPreview(props: PreviewProps) {
  return (
    <div className='w-full h-full'>
      <DocViewer
        documents={[
          {
            uri: generatedDownloadLink(props.file, false, true),
          },
        ]}
        pluginRenderers={DocViewerRenderers}
        config={{
          header: {
            disableHeader: true,
          },
          loadingRenderer: {
            overrideComponent: LoadingRender,
          },
          noRenderer: {
            overrideComponent: ErrorRender,
          },
        }}
        className='min-h-[70vh] max-h-[70vh] w-full h-full rounded-md'
        theme={{
          disableThemeScrollbar: true,
        }}
      />
    </div>
  );
}
