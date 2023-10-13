import { useTextSpeech } from "@/contexts/TextSpeechContext";
import React, { useRef, useCallback, memo, useEffect, useState } from "react";
import YouTube from "react-youtube";

interface YoutubeEmbedEditProps {
  videoId: string;
  opts: any; // Replace 'any' with the actual type of 'opts'
}

export const YoutubeEmbedEdit = memo(
  ({ videoId, opts }: YoutubeEmbedEditProps) => {
    const videoPlayerRef = useRef(null);

    const [currentVideoTime, setCurrentTime] = useState(0);

    const onReady = (event) => {
      console.log("Video Ready:", event.target);
      videoPlayerRef.current = event.target;
    };

    const intervalRef = useRef(null);

    useEffect(() => {
      setCurrentTime(0);
    }, [videoId]);

    const onStateChange = useCallback(
      (event) => {
        console.log("Player State Changed:", event.target.getPlayerState());

        const currentTime = Math.round(event.target.getCurrentTime());
        console.log("Current Time:", currentTime);

        // When video is playing
        if (event.target.getPlayerState() === 1) {
          intervalRef.current = setInterval(() => {
            const currentTime = Math.round(event.target.getCurrentTime());
            console.log("Current Time:", currentTime);
            setCurrentTime(currentTime);
          }, 1000);
        } else {
          clearInterval(intervalRef.current);
        }
      },
      [videoId]
    );

    return (
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        style={{
          width: opts.width,
          height: opts.height,
        }}
        className="h-[40px] overflow-hidden rounded-md bg-black"
      />
    );
  }
);
