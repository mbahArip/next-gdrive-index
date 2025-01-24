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
import {
  DefaultAudioLayout,
  type DefaultLayoutIcons,
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { type z } from "zod";

import { PageLoader } from "~/components/layout";
import Icon from "~/components/ui/icon";

import useLoading from "~/hooks/useLoading";
import { MediaPlayerIcons } from "~/lib/previewHelper";

import { type Schema_File } from "~/types/schema";

import "~/styles/vidstack.css";

type Props = {
  file: z.infer<typeof Schema_File>;
  type: "audio" | "video";
};
export default function EmbedPage({ file, type }: Props) {
  const loading = useLoading();
  const player = useRef<MediaPlayerInstance>(null);
  const [canPlay, setCanPlay] = useState<boolean>(false);

  const [isLoop, setIsLoop] = useState<boolean>(false);

  const icons = useMemo<DefaultLayoutIcons>(
    () => ({
      ...defaultLayoutIcons,
      AirPlayButton: {
        Default: () => (
          <Icon
            hideWrapper
            name='Airplay'
            className='vds-icon size-5'
          />
        ),
        Connecting: () => (
          <Icon
            hideWrapper
            name='LoaderCircle'
            className='vds-icon size-5 animate-spin'
          />
        ),
        Connected: () => (
          <Icon
            hideWrapper
            name='Airplay'
            className='vds-icon size-5'
          />
        ),
      },
      GoogleCastButton: {
        Default: () => (
          <Icon
            hideWrapper
            name='Cast'
            className='vds-icon size-5'
          />
        ),
        Connecting: () => (
          <Icon
            hideWrapper
            name='LoaderCircle'
            className='vds-icon size-5 animate-spin'
          />
        ),
        Connected: () => (
          <Icon
            hideWrapper
            name='Cast'
            className='vds-icon size-5'
          />
        ),
      },
      PlayButton: {
        Play: () => (
          <Icon
            hideWrapper
            name='Play'
            className='vds-icon size-5 fill-current media-ended:hidden media-playing:hidden'
          />
        ),
        Pause: () => (
          <Icon
            hideWrapper
            name='Pause'
            className='vds-icon size-5 fill-current media-paused:hidden'
          />
        ),
        Replay: () => (
          <Icon
            hideWrapper
            name='RotateCcw'
            className='vds-icon hidden size-5 media-ended:block'
          />
        ),
      },
      MuteButton: {
        Mute: () => (
          <Icon
            hideWrapper
            name='VolumeX'
            className='vds-icon mute-icon size-5'
          />
        ),
        VolumeLow: () => (
          <Icon
            hideWrapper
            name='Volume1'
            className='vds-icon volume-low-icon size-5'
          />
        ),
        VolumeHigh: () => (
          <Icon
            hideWrapper
            name='Volume2'
            className='vds-icon volume-high-icon size-5'
          />
        ),
      },
      CaptionButton: {
        On: () => (
          <Icon
            hideWrapper
            name='Captions'
            className='vds-icon size-5'
          />
        ),
        Off: () => (
          <Icon
            hideWrapper
            name='CaptionsOff'
            className='vds-icon size-5'
          />
        ),
      },
      PIPButton: {
        Enter: () => (
          <Icon
            hideWrapper
            name='PictureInPicture'
            className='vds-icon size-5'
          />
        ),
        Exit: () => (
          <Icon
            hideWrapper
            name='X'
            className='vds-icon size-5'
          />
        ),
      },
      FullscreenButton: {
        Enter: () => (
          <Icon
            hideWrapper
            name='Maximize2'
            className='vds-icon size-5'
          />
        ),
        Exit: () => (
          <Icon
            hideWrapper
            name='Minimize2'
            className='vds-icon size-5'
          />
        ),
      },
      SeekButton: {
        Backward: () => (
          <Icon
            hideWrapper
            name='ChevronsLeft'
            className='vds-icon size-5'
          />
        ),
        Forward: () => (
          <Icon
            hideWrapper
            name='ChevronsRight'
            className='vds-icon size-5'
          />
        ),
      },
      DownloadButton: {
        Default: () => (
          <Icon
            hideWrapper
            name='Download'
            className='vds-icon size-5'
          />
        ),
      },
      Menu: {
        Accessibility: () => (
          <Icon
            hideWrapper
            name='PersonStanding'
            className='vds-icon mr-2 size-5'
          />
        ),
        ArrowLeft: () => null,
        ArrowRight: () => (
          <Icon
            hideWrapper
            name='ChevronRight'
            className='vds-icon size-5'
          />
        ),
        Audio: () => (
          <Icon
            hideWrapper
            name='Volume2'
            className='vds-icon mr-2 size-5'
          />
        ),
        AudioBoostUp: () => (
          <Icon
            hideWrapper
            name='Volume2'
            className='vds-icon size-5'
          />
        ),
        AudioBoostDown: () => (
          <Icon
            hideWrapper
            name='Volume'
            className='vds-icon size-5'
          />
        ),
        Chapters: () => (
          <Icon
            hideWrapper
            name='TableOfContents'
            className='vds-icon size-5'
          />
        ),
        Captions: () => (
          <Icon
            hideWrapper
            name='Captions'
            className='vds-icon size-5'
          />
        ),
        Playback: () => (
          <Icon
            hideWrapper
            name='ListVideo'
            className='size5 mr-2 '
          />
        ),
        Settings: () => (
          <Icon
            hideWrapper
            name='Settings'
            className='vds-icon vds-rotate-icon size-5'
          />
        ),
        SpeedUp: () => (
          <Icon
            hideWrapper
            name='ChevronsUp'
            className='vds-icon size-5'
          />
        ),
        SpeedDown: () => (
          <Icon
            hideWrapper
            name='ChevronsDown'
            className='vds-icon size-5'
          />
        ),
        QualityUp: () => null,
        QualityDown: () => null,
        FontSizeUp: () => null,
        FontSizeDown: () => null,
        OpacityUp: () => null,
        OpacityDown: () => null,
        RadioCheck: () => null,
      },
      KeyboardDisplay: {
        Play: () => (
          <div className='grid h-full w-full place-items-center'>
            <Icon
              hideWrapper
              name='Play'
              className='size-6'
            />
          </div>
        ),
        Pause: () => (
          <div className='grid h-full w-full place-items-center'>
            <Icon
              hideWrapper
              name='Pause'
              className='size-6'
            />
          </div>
        ),
        Mute: () => (
          <div className='grid h-full w-full place-items-center'>
            <Icon
              hideWrapper
              name='VolumeX'
              className='size-6'
            />
          </div>
        ),
        VolumeUp: () => (
          <div className='grid h-full w-full place-items-center'>
            <Icon
              hideWrapper
              name='Volume2'
              className='size-6'
            />
          </div>
        ),
        VolumeDown: () => (
          <div className='grid h-full w-full place-items-center'>
            <Icon
              hideWrapper
              name='Volume1'
              className='size-6'
            />
          </div>
        ),
        EnterFullscreen: () => (
          <div className='grid h-full w-full place-items-center'>
            <Icon
              hideWrapper
              name='Maximize2'
              className='size-6'
            />
          </div>
        ),
        ExitFullscreen: () => (
          <div className='grid h-full w-full place-items-center'>
            <Icon
              hideWrapper
              name='Minimize2'
              className='size-6'
            />
          </div>
        ),
        // EnterPiP: () => null,
        // ExitPiP: () => null,
        CaptionsOn: () => (
          <div className='grid h-full w-full place-items-center'>
            <Icon
              hideWrapper
              name='Captions'
              className='size-6'
            />
          </div>
        ),
        CaptionsOff: () => (
          <div className='grid h-full w-full place-items-center'>
            <Icon
              hideWrapper
              name='CaptionsOff'
              className='size-6'
            />
          </div>
        ),
        SeekForward: () => (
          <div className='grid h-full w-full place-items-center'>
            <Icon
              hideWrapper
              name='ChevronsRight'
              className='size-6'
            />
          </div>
        ),
        SeekBackward: () => (
          <div className='grid h-full w-full place-items-center'>
            <Icon
              hideWrapper
              name='ChevronsLeft'
              className='size-6'
            />
          </div>
        ),
      },
    }),
    [],
  );
  const smallAudioLayoutQuery = useCallback<MediaPlayerQuery>(({ width }) => {
    return width < 576;
  }, []);
  const smallVideoLayoutQuery = useCallback<MediaPlayerQuery>(({ width, height }) => {
    return width < 576 || height < 380;
  }, []);

  return (
    <>
      {loading ? (
        <PageLoader message='Preparing media embed...' />
      ) : (
        <MediaPlayer
          ref={player}
          key={file.encryptedId}
          src={{
            src: `/api/preview/${file.encryptedId}`,
            type: file.mimeType as AudioMimeType | VideoMimeType,
          }}
          loop={isLoop}
          autoPlay
          playsInline
          crossOrigin
          viewType={type === "audio" ? "audio" : "video"}
          className='media-player h-fit max-h-screen w-full rounded-xl'
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
            className='h-fit !px-2 !py-2 shadow-md [&.vds-button>svg]:stroke-[--media-controls-color] [&.vds-play-button>svg]:fill-[--audio-play-button-color] [&.vds-play-button>svg]:stroke-[--audio-play-button-color] [&>.vds-captions]:hidden [&>.vds-controls>.vds-controls-group]:inline-flex [&>.vds-controls>.vds-controls-group]:gap-1 [&>.vds-controls>.vds-controls-group]:md:inline-flex [&>.vds-controls>.vds-controls-group]:md:flex-row'
            slots={{
              seekBackwardButton: null,
              seekForwardButton: null,
              playButton: (
                <div className='flex w-fit items-center justify-center'>
                  <SeekButton
                    className='vds-button'
                    seconds={-10}
                  >
                    <icons.SeekButton.Backward />
                  </SeekButton>
                  <PlayButton
                    className='vds-button vds-play-button aspect-square h-10 w-10'
                    disabled={canPlay === false}
                  >
                    {canPlay ? (
                      <>
                        <icons.PlayButton.Play />
                        <icons.PlayButton.Pause />
                        <icons.PlayButton.Replay />
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
                    <icons.SeekButton.Forward />
                  </SeekButton>
                </div>
              ),
              timeSlider: (
                <div className='grid w-full grow place-items-center'>
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
                <div className='inline-flex w-fit items-center justify-between gap-2 md:w-fit'>
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
                    <Menu.Root className='vds-menu'>
                      <Menu.Button
                        className='vds-menu-button vds-button'
                        aria-label='Settings'
                      >
                        <icons.Menu.Settings />
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
            showTooltipDelay={150}
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
              settingsMenu: (
                <Menu.Root className='vds-menu'>
                  <Menu.Button
                    className='vds-menu-button vds-button'
                    aria-label='Settings'
                  >
                    <icons.Menu.Settings />
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
              ),
            }}
          />
        </MediaPlayer>
      )}
    </>
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
