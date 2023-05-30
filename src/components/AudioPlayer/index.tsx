import { useState, useEffect } from "react";

import { AudioPlayerStyle } from "./style";

import { PlayIcon } from "@/icons/Play";
import { PauseIcon } from "@/icons/Pause";

import { useTheme } from "styled-components";
import React from "react";

import { DownloadButton } from "../DownloadButton";
import { OptionMenu } from "../DocumentEditor/OptionMenu";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { useTextSpeech } from "@/contexts/TextSpeechContext";

interface Props {
  audioURL: string | null;
  fileName: string;
  content: string;
}

function AudioPlayer({ audioURL, fileName, content }: Props): JSX.Element {
  const [seekValue, setSeekValue] = useState<number>(0);
  const [seekMax, setSeekMax] = useState<number>(0);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [showNib, setShowNib] = useState<boolean>(false);
  const [nibPosition, setNibPosition] = useState<number>(0);

  const theme = useTheme();

  const { generatedAudio, setGenerateAudio, setIsPlaying, isPlaying } =
    useTextSpeech();

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

  // useEffect(() => {
  //   if (generatedAudio) {
  //     generatedAudio;
  //     generatedAudio.play();
  //     setIsPlaying(true);
  //     console.log(generatedAudio.src);
  //   }
  // }, [generatedAudio]);

  const handleSeekStart = () => {
    setIsSeeking(true);
    // generatedAudio?.pause();
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
      const percent = x / width;
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

  const handlePlay = () => {
    setIsPlaying(true);
    generatedAudio?.play();
  };
  const handlePause = () => {
    setIsPlaying(false);
    generatedAudio?.pause();
  };

  const formatTime = (timeInSeconds: number) => {
    const nonNegativeTime = Math.max(0, timeInSeconds); // Ensure time is non-negative
    const date = new Date(nonNegativeTime * 1000);
    const minutes = date.getUTCMinutes();
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <AudioPlayerStyle className="relative block border border-gray-300 bg-white dark:border-gray-700 dark:bg-secondary">
      <div className="flex items-center ">
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

        <div
          className="audioPlayer_timeline_container group "
          onMouseDown={handleSeekStart}
          onMouseUp={handleSeekEnd}
          onMouseMove={handleSeekMove}
          onMouseEnter={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        >
          <div className="audioPlayer_timeline bg-gray-400 dark:bg-gray-700">
            <div
              className="audioPlayer_timeline_track  bg-gray-400 group-hover:bg-brand dark:bg-foreground"
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
        {isPlaying ? (
          <div className="audioPlayer_current-time mr-1">
            {formatTime(Math.floor(seekValue))}
          </div>
        ) : (
          <div className="audioPlayer_max-time mr-1">
            {formatTime(Math.floor(seekMax))}
          </div>
        )}
        <DownloadButton audioURL={audioURL} fileName={fileName} />
      </div>
      <div className="mt-4 items-center overflow-hidden overflow-ellipsis whitespace-nowrap text-sm">
        {content}
      </div>
    </AudioPlayerStyle>
  );
}

export default AudioPlayer;
