"use client";

import {
  type AudioMimeType,
  MediaPlayer,
  type MediaPlayerInstance,
  type MediaPlayerQuery,
  MediaProvider,
  Menu,
  PlayButton,
  SeekButton,
  Time,
  TimeSlider,
  type VideoMimeType,
  useAudioGainOptions,
  usePlaybackRateOptions,
} from "@vidstack/react";
import { DefaultAudioLayout, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { type z } from "zod";

import { PageLoader } from "~/components/layout";
import Icon from "~/components/ui/icon";

import useLoading from "~/hooks/useLoading";
import { MediaPlayerIcons, getPreviewIcon } from "~/lib/previewHelper";
import { cn, formatDate } from "~/lib/utils";

import { type Schema_File } from "~/types/schema";

import "~/styles/vidstack.css";

type Props = {
  file: z.infer<typeof Schema_File>;
  type: "video" | "audio";
  playlist: z.infer<typeof Schema_File>[];
};
export default function PreviewMedia({ file, type, playlist }: Props) {
  const player = useRef<MediaPlayerInstance>(null);
  const [canPlay, setCanPlay] = useState<boolean>(false);

  const [isLoop, setIsLoop] = useState<boolean>(false);
  const loading = useLoading();

  const smallAudioLayoutQuery = useCallback<MediaPlayerQuery>(({ width }) => {
    return width < 576;
  }, []);
  const smallVideoLayoutQuery = useCallback<MediaPlayerQuery>(({ width, height }) => {
    return width < 576 || height < 380;
  }, []);

  return (
    <div className='flex h-full w-full items-center justify-center gap-2 py-3 pb-0'>
      {loading ? (
        <PageLoader message='Loading media...' />
      ) : (
        <MediaPlayer
          ref={player}
          key={file.encryptedId}
          src={{
            src: `/api/preview/${file.encryptedId}`,
            type: file.mimeType as AudioMimeType | VideoMimeType,
          }}
          loop={isLoop}
          playsInline
          crossOrigin
          viewType={type === "audio" ? "audio" : "video"}
          className='media-player h-full w-full rounded-xl'
          preload='auto'
          onLoadedMetadata={() => {
            setCanPlay(true);
          }}
        >
          <MediaProvider />
          <DefaultAudioLayout
            icons={MediaPlayerIcons}
            colorScheme='default'
            smallLayoutWhen={smallAudioLayoutQuery}
            showTooltipDelay={150}
            className='h-fit !px-2 !py-4 shadow-md [&.vds-button>svg]:stroke-[--media-controls-color] [&.vds-play-button>svg]:fill-[--audio-play-button-color] [&.vds-play-button>svg]:stroke-[--audio-play-button-color] [&>.vds-captions]:hidden [&>.vds-controls>.vds-controls-group]:inline-block [&>.vds-controls>.vds-controls-group]:md:inline-flex [&>.vds-controls>.vds-controls-group]:md:flex-row [&>.vds-controls>.vds-controls-group]:md:gap-1'
            slots={{
              seekBackwardButton: null,
              seekForwardButton: null,
              playButton: (
                <div className='flex w-full items-center justify-center gap-1 md:w-fit'>
                  <SeekButton
                    className='vds-button'
                    seconds={-10}
                  >
                    <MediaPlayerIcons.SeekButton.Backward />
                  </SeekButton>
                  <PlayButton
                    className='vds-button vds-play-button aspect-square'
                    disabled={canPlay === false}
                  >
                    {canPlay ? (
                      <>
                        <MediaPlayerIcons.PlayButton.Play />
                        <MediaPlayerIcons.PlayButton.Pause />
                        <MediaPlayerIcons.PlayButton.Replay />
                      </>
                    ) : (
                      <Icon
                        hideWrapper
                        name='LoaderCircle'
                        className='vds-icon size-5 animate-spin'
                      />
                    )}
                  </PlayButton>
                  <SeekButton
                    className='vds-button'
                    seconds={10}
                  >
                    <MediaPlayerIcons.SeekButton.Forward />
                  </SeekButton>
                </div>
              ),
              timeSlider: (
                <div className='grid w-auto grow place-items-center md:w-full'>
                  <TimeSlider.Root className='vds-time-slider vds-slider !opacity-100'>
                    <TimeSlider.Track className='vds-slider-track'>
                      <TimeSlider.Progress className='vds-slider-progress' />
                      <TimeSlider.TrackFill className='vds-slider-track-fill vds-slider-track' />
                    </TimeSlider.Track>
                  </TimeSlider.Root>
                </div>
              ),
              beforeEndTime: <div className='vds-controls-spacer' />,
              endTime: (
                <div className='inline-flex w-full items-center justify-between gap-2 md:w-fit'>
                  <div className='inline-flex items-center text-sm'>
                    <Time
                      className='time'
                      type='current'
                    />
                    <span className='mx-1'>/</span>
                    <Time
                      className='time'
                      type='duration'
                    />
                  </div>

                  <div className='flex items-center'>
                    <PlaylistMenu
                      playlist={playlist}
                      file={file}
                      placement={"bottom end"}
                    />

                    <Menu.Root className='vds-menu'>
                      <Menu.Button
                        className='vds-menu-button vds-button'
                        aria-label='Settings'
                      >
                        <MediaPlayerIcons.Menu.Settings />
                      </Menu.Button>
                      <Menu.Items
                        className='vds-menu-items'
                        placement={"bottom"}
                        offset={0}
                      >
                        {/* Loop */}
                        <Menu.Root>
                          <Menu.Button className='vds-menu-item'>
                            <ChevronLeft className='vds-menu-close-icon' />
                            <Icon
                              name='Repeat'
                              className='vds-icon'
                            />
                            <span className='vds-menu-item-label'>Loop</span>
                            <span className='vds-menu-item-hint'>{isLoop ? "On" : "Off"}</span>
                            <ChevronRight className='vds-menu-open-icon' />
                          </Menu.Button>
                          <Menu.Content className='vds-menu-items'>
                            <Menu.RadioGroup
                              className='vds-radio-group'
                              value={String(isLoop)}
                            >
                              <Menu.Radio
                                className='vds-radio'
                                value='true'
                                onSelect={() => setIsLoop(true)}
                              >
                                <Icon
                                  name='Check'
                                  className='vds-icon'
                                />
                                <span className='vds-radio-label'>On</span>
                              </Menu.Radio>
                              <Menu.Radio
                                className='vds-radio'
                                value='false'
                                onSelect={() => setIsLoop(false)}
                              >
                                <Icon
                                  name='Check'
                                  className='vds-icon'
                                />
                                <span className='vds-radio-label'>Off</span>
                              </Menu.Radio>
                            </Menu.RadioGroup>
                          </Menu.Content>
                        </Menu.Root>

                        {/* Playback Speed */}
                        <PlaybackMenu />

                        {/* Audio Gain */}
                        <AudioGain />
                      </Menu.Items>
                    </Menu.Root>
                  </div>
                </div>
              ),
              settingsMenu: null,
            }}
          />
          <DefaultVideoLayout
            icons={MediaPlayerIcons}
            colorScheme='default'
            smallLayoutWhen={smallVideoLayoutQuery}
            showTooltipDelay={200}
            slots={{
              currentTime: (
                <Time
                  className='text-sm'
                  type='current'
                />
              ),
              endTime: (
                <Time
                  className='text-sm'
                  type='duration'
                />
              ),
              beforeSettingsMenu: (
                <PlaylistMenu
                  playlist={playlist}
                  file={file}
                />
              ),
              settingsMenu: (
                <>
                  <Menu.Root className='vds-menu'>
                    <Menu.Button
                      className='vds-menu-button vds-button'
                      aria-label='Settings'
                    >
                      <MediaPlayerIcons.Menu.Settings />
                    </Menu.Button>
                    <Menu.Items
                      className='vds-menu-items'
                      placement={"top"}
                      offset={0}
                    >
                      {/* Loop */}
                      <Menu.Root>
                        <Menu.Button className='vds-menu-item'>
                          <ChevronLeft className='vds-menu-close-icon' />
                          <Icon
                            name='Repeat'
                            className='vds-icon'
                          />
                          <span className='vds-menu-item-label'>Loop</span>
                          <span className='vds-menu-item-hint'>{isLoop ? "On" : "Off"}</span>
                          <ChevronRight className='vds-menu-open-icon' />
                        </Menu.Button>
                        <Menu.Content className='vds-menu-items'>
                          <Menu.RadioGroup
                            className='vds-radio-group'
                            value={String(isLoop)}
                          >
                            <Menu.Radio
                              className='vds-radio'
                              value='true'
                              onSelect={() => setIsLoop(true)}
                            >
                              <Icon
                                name='Check'
                                className='vds-icon'
                              />
                              <span className='vds-radio-label'>On</span>
                            </Menu.Radio>
                            <Menu.Radio
                              className='vds-radio'
                              value='false'
                              onSelect={() => setIsLoop(false)}
                            >
                              <Icon
                                name='Check'
                                className='vds-icon'
                              />
                              <span className='vds-radio-label'>Off</span>
                            </Menu.Radio>
                          </Menu.RadioGroup>
                        </Menu.Content>
                      </Menu.Root>

                      {/* Playback Speed */}
                      <PlaybackMenu />

                      {/* Audio Gain */}
                      <AudioGain />
                    </Menu.Items>
                  </Menu.Root>
                </>
              ),
            }}
          />
        </MediaPlayer>
      )}
    </div>
  );
}

function PlaybackMenu() {
  const options = usePlaybackRateOptions();
  const hint = options.selectedValue === "1" ? "Normal" : `${options.selectedValue}x`;

  return (
    <Menu.Root>
      <Menu.Button
        className='vds-menu-item'
        disabled={options.disabled}
      >
        <ChevronLeft className='vds-menu-close-icon' />
        <Icon
          name='Gauge'
          className='vds-icon'
        />
        <span className='vds-menu-item-label'>Playback Speed</span>
        <span className='vds-menu-item-hint'>{hint}</span>
        <ChevronRight className='vds-menu-open-icon' />
      </Menu.Button>
      <Menu.Content className='vds-menu-items'>
        <Menu.RadioGroup
          className='vds-radio-group'
          value={options.selectedValue}
        >
          {/* eslint-disable-next-line @typescript-eslint/unbound-method */}
          {options.map(({ value, select, label }) => (
            <Menu.Radio
              key={value}
              className='vds-radio'
              value={value}
              onSelect={select}
            >
              <Icon
                name='Check'
                className='vds-icon'
              />
              <span className='vds-radio-label'>{label}</span>
            </Menu.Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}
function AudioGain() {
  const options = useAudioGainOptions({
    disabledLabel: "100%",
  });
  const hint = options.selectedValue ? `${Number(options.selectedValue) * 100}%` : "100%";

  return (
    <Menu.Root>
      <Menu.Button
        className='vds-menu-item'
        disabled={options.disabled}
      >
        <ChevronLeft className='vds-menu-close-icon' />
        <Icon
          name='Volume2'
          className='vds-icon'
        />
        <span className='vds-menu-item-label'>Audio Boost</span>
        <span className='vds-menu-item-hint'>{hint}</span>
        <ChevronRight className='vds-menu-open-icon' />
      </Menu.Button>
      <Menu.Content className='vds-menu-items'>
        <Menu.RadioGroup
          className='vds-radio-group'
          value={options.selectedValue}
        >
          {/* eslint-disable-next-line @typescript-eslint/unbound-method */}
          {options.map(({ value, select, label }) => (
            <Menu.Radio
              key={value}
              className='vds-radio'
              value={value}
              onSelect={select}
            >
              <Icon
                name='Check'
                className='vds-icon'
              />
              <span className='vds-radio-label capitalize'>{label}</span>
            </Menu.Radio>
          ))}
        </Menu.RadioGroup>
      </Menu.Content>
    </Menu.Root>
  );
}
function PlaylistMenu({
  playlist,
  file,
  placement = "top end",
}: {
  playlist: z.infer<typeof Schema_File>[];
  file: z.infer<typeof Schema_File>;
  placement?: Menu.ItemsProps["placement"];
}) {
  return (
    <Menu.Root className='vds-menu'>
      <Menu.Button
        className='vds-menu-button vds-button'
        aria-label='Playlist'
      >
        <MediaPlayerIcons.Menu.Chapters />
      </Menu.Button>
      <Menu.Items
        className='vds-menu-items group space-y-1'
        placement={placement}
      >
        {playlist.map((item) => {
          const isCurrent = `${item.name}#${item.size}` === `${file.name}#${file.size}`;

          const Wrapper = ({ children, className }: React.PropsWithChildren<{ className?: string }>) =>
            isCurrent ? (
              <div
                className={className}
                title={item.name}
              >
                {children}
              </div>
            ) : (
              <Link
                href={`${item.name}`}
                className={className}
                title={item.name}
              >
                {children}
              </Link>
            );

          return (
            <Wrapper
              key={`playlist-${item.encryptedId}`}
              className={cn(
                "flex w-full max-w-96 grid-cols-4 place-items-center gap-2 rounded-lg",
                isCurrent ? "bg-primary/10" : "hover:bg-primary/5",
              )}
            >
              {/* Thumbnail */}
              <div
                className={cn(
                  "aspect-video h-16 grow-0 overflow-hidden rounded-lg bg-black",
                  isCurrent && "border border-primary",
                )}
              >
                {item.mimeType.includes("video") ? (
                  <img
                    src={`/api/thumb/${item.encryptedId}`}
                    alt={`Thumbnail for ${item.name}`}
                    className='aspect-video w-full object-contain'
                  />
                ) : (
                  <div className={"grid aspect-video w-full place-items-center"}>
                    <Icon
                      name={getPreviewIcon(item.fileExtension ?? "", item.mimeType)}
                      className={"size-6"}
                    />
                  </div>
                )}
              </div>

              <div className={"col-span-3 w-full flex-1 p-2"}>
                <p className={"line-clamp-1 break-all"}>{item.name}</p>
                <span className={"text-sm text-muted-foreground"}>{formatDate(item.modifiedTime)}</span>
              </div>
            </Wrapper>
          );
        })}
      </Menu.Items>
    </Menu.Root>
  );
}
