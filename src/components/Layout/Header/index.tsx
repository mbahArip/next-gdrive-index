import { Icon } from "@iconify/react";
import axios from "axios";
import gIndexConfig from "config";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import ButtonIcon from "components/ButtonIcon";
import Modal from "components/Modal";
import Tooltip from "components/Tooltip";

import bytesToReadable from "utils/bytesFormat";
import { getPreviewIcon } from "utils/previewHelper";

import { IGDriveFiles } from "types/api/files";
import { APISearchResponse } from "types/api/response";

interface HeaderProps {
  viewSelector?: {
    view: "grid" | "list";
    setView: (view: "grid" | "list") => void;
  };
  showPasswordLayout?: boolean;
}

export default function Header(props: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [axiosCancelToken, setAxiosCancelToken] = useState<ReturnType<typeof axios.CancelToken.source> | null>(null); // eslint-disable-line
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<(IGDriveFiles & { redirect: string })[]>([]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    if (axiosCancelToken) {
      axiosCancelToken.cancel();
    }
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    if (!searchModalOpen) {
      setSearchResults([]);
      setSearchQuery("");
      setSearchLoading(false);
    }
  }, [searchModalOpen]);

  useEffect(() => {
    if (!debouncedSearchQuery) {
      setSearchLoading(false);
      setSearchResults([]);
      return;
    }

    const source = axios.CancelToken.source();
    setAxiosCancelToken(source);

    axios
      .get<APISearchResponse>("/api/search", {
        params: {
          query: debouncedSearchQuery,
        },
        cancelToken: source.token,
      })
      .then((res) => {
        setSearchResults(res.data.files);
      })
      .catch((err) => {
        if (axios.isCancel(err)) {
          return;
        } else {
          console.error(err);
          throw new Error(err);
        }
      })
      .finally(() => {
        setSearchLoading(false);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  return (
    <>
      <div className='flex items-center justify-between gap-4'>
        <h1 className='text-2xl font-medium'>{gIndexConfig.siteConfig.siteName}</h1>

        {!props.showPasswordLayout && (
          <div className='flex items-center gap-4'>
            {props.viewSelector && (
              <ButtonGroup className='border border-primary-700 tablet:flex hidden'>
                <Button
                  variant={props.viewSelector.view === "list" ? "accent" : "transparent"}
                  startIcon={"ion:list"}
                  onClick={() => props.viewSelector?.setView("list")}
                >
                  List view
                </Button>
                <Button
                  variant={props.viewSelector.view === "grid" ? "accent" : "transparent"}
                  startIcon={"ion:grid"}
                  onClick={() => props.viewSelector?.setView("grid")}
                >
                  Grid view
                </Button>
              </ButtonGroup>
            )}

            <Tooltip content='Search file'>
              <ButtonIcon
                icon='ion:search'
                variant='transparent'
                onClick={() => {
                  setSearchModalOpen(true);
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 100);
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>
      {!props.showPasswordLayout && props.viewSelector && (
        <div className='flex w-full items-center tablet:hidden'>
          <ButtonGroup className='border border-primary-700 w-full'>
            <Button
              variant={props.viewSelector.view === "list" ? "accent" : "transparent"}
              size='small'
              startIcon={"ion:list"}
              onClick={() => props.viewSelector?.setView("list")}
            >
              List view
            </Button>
            <Button
              variant={props.viewSelector.view === "grid" ? "accent" : "transparent"}
              size='small'
              startIcon={"ion:grid"}
              onClick={() => props.viewSelector?.setView("grid")}
            >
              Grid view
            </Button>
          </ButtonGroup>
        </div>
      )}

      <Modal
        key={"search-modal"}
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        title='Search'
      >
        <div className='w-full flex flex-col gap-2'>
          <input
            ref={inputRef}
            type='text'
            placeholder='Input search query'
            className='w-full px-4 py-2 bg-primary-900 outline-none border border-primary-500 rounded-lg'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchLoading ? (
            <div className='w-full py-8 flex items-center justify-center gap-2 animate-pulse'>
              <div className='w-fit h-fit relative grid place-items-center'>
                <img
                  src={gIndexConfig.siteConfig.siteIcon}
                  alt={gIndexConfig.siteConfig.siteName}
                  className='w-12 -top-1 relative'
                />
                <div className='absolute w-12 h-12 bg-transparent border border-primary-50 rounded-full animate-ping' />
              </div>
              <span>Searching file...</span>
            </div>
          ) : (
            <div className='flex flex-col gap-2 max-h-96 overflow-auto'>
              {searchResults.length === 0 ? (
                <div className='w-full py-8 flex items-center justify-center gap-2'>
                  <span>No results found</span>
                </div>
              ) : (
                <>
                  {searchResults.map((file) => (
                    <Link
                      href={file.redirect}
                      key={file.encryptedId}
                      className='flex items-center gap-4 w-full flex-grow-0 flex-shrink bg-primary-950 border border-primary-700 hover:bg-primary-900 transition-smooth text-primary-50 rounded-lg'
                    >
                      {file.thumbnailLink &&
                      (file.mimeType.startsWith("video") || file.mimeType.startsWith("image")) ? (
                        <img
                          src={file.thumbnailLink}
                          alt={file.name}
                          className='rounded-md object-cover flex-shrink-0 flex-grow-0 w-16 h-16'
                          loading='lazy'
                        />
                      ) : (
                        <Icon
                          icon={
                            file.mimeType === "application/vnd.google-apps.folder"
                              ? "ion:folder"
                              : getPreviewIcon(file.fileExtension!, file.mimeType!)
                          }
                          color='currentColor'
                          className='flex-shrink-0 flex-grow-0 w-16 h-16 p-4'
                        />
                      )}
                      <div className='flex flex-col'>
                        <span className='font-medium'>{file.name}</span>
                        <div className='flex items-center justify-start gap-2 text-primary-500'>
                          <span className='text-sm whitespace-nowrap'>
                            {[
                              file.mimeType && file.mimeType.includes("folder") && "Folder",
                              file.fileExtension && file.fileExtension.toUpperCase(),
                            ]
                              .filter((item) => item)
                              .join(" ・ ")}
                          </span>
                        </div>
                        <div className='flex items-center justify-start gap-2 text-primary-500'>
                          <span className='text-sm whitespace-nowrap'>
                            {[
                              new Date(file.modifiedTime).toLocaleDateString("default", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }),
                              file.size ? bytesToReadable(file.size) : undefined,
                            ]
                              .filter((item) => item)
                              .join(" ・ ")}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
