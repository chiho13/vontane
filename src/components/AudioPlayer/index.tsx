import { useState, useEffect, useContext } from "react";

import { AudioPlayerStyle } from "./style";

import { PlayIcon } from "@/icons/Play";
import { PauseIcon } from "@/icons/Pause";

import { useTheme } from "styled-components";
import React from "react";

import { DownloadButton } from "../DownloadButton";
import { OptionMenu } from "../DocumentEditor/OptionMenu";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { AiFillSound } from "react-icons/ai";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { cn } from "@/utils/cn";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocalStorage } from "usehooks-ts";
import { AudioManagerContext } from "@/contexts/PreviewAudioContext";

interface Props {
  audioURL: string | null;
  fileName: string;
  content?: string;
  id?: string;
  classNames?: string;
  isPreview?: boolean;
}

function AudioPlayer({
  audioURL,
  fileName,
  content,
  id,
  classNames = "py-[10px]",
  isPreview = false,
}: Props): JSX.Element {
  const [seekValue, setSeekValue] = useState<number>(0);
  const [seekMax, setSeekMax] = useState<number>(0);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [showNib, setShowNib] = useState<boolean>(false);
  const [nibPosition, setNibPosition] = useState<number>(0);

  const theme = useTheme();

  const { playAudio, pauseAudio } = useContext(AudioManagerContext);
  const [generatedAudio, setGenerateAudio] = useState<HTMLAudioElement | null>(
    null
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useLocalStorage<number>(
    `playbackSpeed-${fileName}`,
    1.0
  );

  useEffect(() => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      setGenerateAudio(audio);

      return () => {
        setGenerateAudio(null);
      };
    }
  }, [audioURL]);

  useEffect(() => {
    if (generatedAudio) {
      const handleTimeUpdate = () => {
        if (!isSeeking) {
          setSeekValue(generatedAudio.currentTime);
          setNibPosition(generatedAudio.currentTime / generatedAudio.duration);
        }
      };

      const handleLoadedMetadata = () => {
        setSeekMax(generatedAudio.duration);
      };

      const handleEnded = () => {
        setIsPlaying(false);
      };

      const handlePlay = () => {
        setIsPlaying(true);
      };

      const handlePause = () => {
        setIsPlaying(false);
      };

      generatedAudio.addEventListener("timeupdate", handleTimeUpdate);
      generatedAudio.addEventListener("loadedmetadata", handleLoadedMetadata);
      generatedAudio.addEventListener("ended", handleEnded);
      generatedAudio.addEventListener("play", handlePlay);
      generatedAudio.addEventListener("pause", handlePause);

      return () => {
        generatedAudio.removeEventListener("timeupdate", handleTimeUpdate);
        generatedAudio.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        generatedAudio.removeEventListener("ended", handleEnded);
        // generatedAudio.removeEventListener("play", handlePlay);
        // generatedAudio.removeEventListener("pause", handlePause);
      };
    }
  }, [generatedAudio, isSeeking]);

  const handleSeekStart = () => {
    setIsSeeking(true);
    // generatedAudio?.pause();
  };

  useEffect(() => {
    if (isPlaying && generatedAudio) {
      generatedAudio.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, generatedAudio]);

  // const handlePlay = () => {
  //   setIsPlaying(true);
  //   if (generatedAudio) {

  //     generatedAudio.play();
  //   }
  // };

  // const handlePause = () => {
  //   setIsPlaying(false);
  //   generatedAudio?.pause();
  // };

  const handlePlay = () => {
    setIsPlaying(true);
    if (generatedAudio) {
      generatedAudio.playbackRate = playbackSpeed;
      playAudio(generatedAudio);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    pauseAudio();
  };

  const handleStop = () => {
    setIsPlaying(false);
    generatedAudio?.pause();
    if (generatedAudio) {
      generatedAudio.currentTime = 0;
    }
  };

  const handleSeekEnd = (event: React.MouseEvent<HTMLDivElement>) => {
    setIsSeeking(false);
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const percent = x / width;
    if (generatedAudio && !generatedAudio.paused) {
      generatedAudio.currentTime = percent * generatedAudio.duration;
      generatedAudio.play();
    } else if (generatedAudio) {
      generatedAudio.currentTime = percent * generatedAudio.duration;
    }
  };

  const handleSeekMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isSeeking && generatedAudio) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const width = rect.width;
      let percent = x / width;
      percent = Math.max(0, percent); // Ensure percent is not less than 0
      setSeekValue(percent * generatedAudio.duration);
      setNibPosition(percent);
    }
  };

  const handleMouseOver = () => {
    setShowNib(true);
  };

  const handleMouseLeave = () => {
    setShowNib(false);
  };

  const formatTime = (timeInSeconds: number) => {
    const nonNegativeTime = Math.max(0, timeInSeconds); // Ensure time is non-negative
    const date = new Date(nonNegativeTime * 1000);
    const minutes = date.getUTCMinutes();
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <AudioPlayerStyle
      key={id}
      className={cn(
        `relative flex items-center  gap-2 border border-gray-300 bg-white dark:border-accent dark:bg-transparent`,
        classNames
      )}
    >
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        className="play_pause_button group relative flex h-[24px] w-[24px] items-center justify-center rounded-full bg-brand transition duration-200 hover:bg-brand/90 dark:bg-foreground dark:hover:bg-brand"
      >
        {isPlaying ? (
          <IoIosPause className="pause-icon h-5 w-5 text-white group-hover:text-gray-100 dark:text-brand  group-hover:dark:text-foreground" />
        ) : (
          <IoIosPlay className="play-icon relative left-[1px] h-5 w-5 text-white  group-hover:text-gray-100 dark:text-brand  group-hover:dark:text-foreground" />
        )}
      </button>

      {content.length > 100 && (
        <div
          className="audioPlayer_timeline_container group "
          onMouseDown={handleSeekStart}
          onMouseUp={handleSeekEnd}
          onMouseMove={handleSeekMove}
          onMouseEnter={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        >
          <div className="audioPlayer_timeline bg-gray-300 dark:bg-gray-700">
            <div
              className="audioPlayer_timeline_track  bg-gray-400 bg-muted-foreground group-hover:bg-brand dark:bg-foreground"
              style={{
                width: `${
                  seekValue === seekMax
                    ? "100"
                    : (Math.floor(seekValue) / seekMax) * 100
                }%`,
                borderTopRightRadius: `${seekValue === seekMax ? "3px" : "0"}`,
                borderBottomRightRadius: `${
                  seekValue === seekMax ? "3px" : "0"
                }`,
              }}
            ></div>
            {/* {showNib && <div className="audioPlayer_nib"></div>} */}
            {showNib && (
              <div
                className="audioPlayer_nib"
                style={{
                  left: `${
                    seekValue === seekMax
                      ? "100"
                      : (Math.floor(seekValue) / seekMax) * 100
                  }%`,
                  transform: "translateX(-6px)",
                }}
              ></div>
            )}
          </div>
        </div>
      )}
      {content.length > 100 &&
        (isPlaying ? (
          <div className="audioPlayer_current-time">
            {formatTime(Math.floor(seekValue))}
          </div>
        ) : (
          <div className="audioPlayer_max-time">
            {formatTime(Math.floor(seekMax))}
          </div>
        ))}

      {content.length > 100 && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="mr-2 flex  h-[22px] items-center justify-center rounded-md border border-muted-foreground bg-background px-1 text-xs  text-muted-foreground hover:border-accent hover:bg-white hover:text-gray-700 dark:border-muted-foreground dark:bg-secondary dark:text-foreground dark:hover:bg-muted">
                    {playbackSpeed}X{/* <ChevronDown className="ml-1 w-3" /> */}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className=" border border-gray-300 bg-background dark:border-gray-500 dark:bg-secondary"
                >
                  <DropdownMenuItem
                    className="dark:text-foreground hover:dark:bg-accent"
                    onClick={() => setPlaybackSpeed(0.5)}
                  >
                    <span className="text-foreground">0.5x</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="dark:text-foreground hover:dark:bg-accent"
                    onClick={() => setPlaybackSpeed(0.75)}
                  >
                    <span className="text-foreground">0.75x</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:dark:bg-accent"
                    onClick={() => setPlaybackSpeed(1.0)}
                  >
                    <span className="text-foreground"> 1x</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:dark:bg-accent"
                    onClick={() => setPlaybackSpeed(1.25)}
                  >
                    <span className="text-foreground"> 1.25x</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:dark:bg-accent"
                    onClick={() => setPlaybackSpeed(1.5)}
                  >
                    <span className="text-foreground"> 1.5x</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:dark:bg-accent"
                    onClick={() => setPlaybackSpeed(1.75)}
                  >
                    <span className="text-foreground"> 1.75x</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:dark:bg-accent"
                    onClick={() => setPlaybackSpeed(2.0)}
                  >
                    <span className="text-foreground">2x</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipTrigger>
            <TooltipContent
              className="border-black  dark:bg-white dark:text-muted"
              side="top"
              sideOffset={10}
            >
              <p className="text-[12px]">Playback Speed</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {!isPreview && <DownloadButton url={audioURL} fileName={fileName} />}
    </AudioPlayerStyle>
  );
}

export default AudioPlayer;
