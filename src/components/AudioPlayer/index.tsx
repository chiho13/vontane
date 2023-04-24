import { useState, useEffect } from "react";

import { AudioPlayerStyle } from "./style";

import { PlayIcon } from "@/icons/Play";
import { PauseIcon } from "@/icons/Pause";

import { useTheme } from "styled-components";
import React from "react";

import { DownloadButton } from "../DownloadButton";

interface Props {
  generatedAudio: HTMLAudioElement | null;
}

function AudioPlayer({ generatedAudio }: Props): JSX.Element {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [seekValue, setSeekValue] = useState<number>(0);
  const [seekMax, setSeekMax] = useState<number>(0);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [showNib, setShowNib] = useState<boolean>(false);
  const [nibPosition, setNibPosition] = useState<number>(0);

  const theme = useTheme();

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

      generatedAudio.addEventListener("timeupdate", handleTimeUpdate);
      generatedAudio.addEventListener("loadedmetadata", handleLoadedMetadata);
      generatedAudio.addEventListener("ended", handleEnded);
      // generatedAudio.addEventListener("play", handlePlay);
      // generatedAudio.addEventListener("pause", handlePause);

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
    <AudioPlayerStyle>
      <button
        onClick={isPlaying ? handlePause : handlePlay}
        className="play_pause_button"
      >
        {isPlaying ? <PauseIcon theme={theme} /> : <PlayIcon theme={theme} />}
      </button>

      <div className="audioPlayer_current-time">
        {formatTime(Math.floor(seekValue))}
      </div>

      <div
        className="audioPlayer_timeline_container"
        onMouseDown={handleSeekStart}
        onMouseUp={handleSeekEnd}
        onMouseMove={handleSeekMove}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseLeave}
      >
        <div className="audioPlayer_timeline">
          <div
            className="audioPlayer_timeline_track"
            style={{
              width: `${
                seekValue === seekMax
                  ? "100"
                  : (Math.floor(seekValue) / seekMax) * 100
              }%`,
              borderTopRightRadius: `${seekValue === seekMax ? "3px" : "0"}`,
              borderBottomRightRadius: `${seekValue === seekMax ? "3px" : "0"}`,
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
      <div className="audioPlayer_max-time">
        {formatTime(Math.floor(seekMax))}
      </div>

      {/* <button
        onClick={() => {
          generatedAudio?.pause();
          generatedAudio.currentTime = 0;
        }}
      >
        Stop
      </button> */}
      {/* <div className="ml-4">
        <DownloadButton
          generatedAudio={generatedAudio}
          transcriptionId={transcriptionId}
        />
      </div> */}
    </AudioPlayerStyle>
  );
}

export default AudioPlayer;
