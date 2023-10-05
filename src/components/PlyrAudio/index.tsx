import React, { useState, useEffect } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import { useTheme } from "styled-components";
import { StyledPlyr } from "../ui/plyr";

export const PlyrAudioPlayer = ({ audioURL, content, isPreview = false }) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  let controls;

  if (isPreview) {
    controls = ["play", "restart", "progress", "current-time"];
  } else if (!isPreview && content.length < 40) {
    controls = ["play"];
  } else {
    controls = ["play", "restart", "progress", "current-time", "duration"];
  }

  return (
    <StyledPlyr
      theme={theme}
      className={`${
        !isPreview &&
        content.length > 40 &&
        "mb-4 rounded-lg border border-gray-200 shadow-sm dark:border-neutral-800"
      }`}
    >
      <Plyr
        source={{
          type: "audio",
          sources: [
            {
              src: audioURL,
              type: "audio/mp3",
            },
          ],
        }}
        options={{
          controls,
          settings: ["speed"],
          speed: { selected: 1, options: [0.7, 1, 1.25, 1.5, 2] },
        }}
      />
    </StyledPlyr>
  );
};
