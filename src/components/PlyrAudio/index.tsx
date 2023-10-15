import React, { useState, useEffect } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import styled, { useTheme } from "styled-components";

const StyledPlyr = styled.div`
  .plyr--audio .plyr__controls {
    gap: 5px;
    background: transparent;
  }

  .plyr--audio .plyr__control:hover,
  .plyr__control:focus-visible,
  .plyr--audio .plyr__control[aria-expanded="true"] {
    background: #eeeeee;
    opacity: 0.9;
    svg {
      fill: ${(props) => props.theme.brandColor} !important;
    }

    * {
      color: #333333;
    }

    .dark & {
      background: #333333;

      svg {
        fill: #f1f1f1 !important;
      }
    }
  }

  .plyr__control:focus-visible {
    outline: 2px dashed ${(props) => props.theme.brandColor};
  }
  .plyr__control svg {
    fill: ${(props) => props.theme.brandColor};
  }

  .plyr--audio .plyr__control {
    border-radius: 6px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
      width: 16px;
    }
  }
  .plyr--audio .plyr__control[data-plyr="play"] {
    border-radius: 6px;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #eeeeee;

    .dark & {
      border: 1px solid #333333;
    }
    svg {
      width: 16px;
    }
  }

  .plyr__control svg {
    .dark & {
      fill: #f1f1f1;
    }
  }

  .plyr__time {
    .dark & {
      color: #ffffff;
    }
  }

  .plyr__control:hover svg {
    fill: ${(props) => props.theme.brandColor};
  }

  .plyr--audio .plyr__control[aria-expanded="true"] svg {
    fill: ${(props) => props.theme.brandColor};
  }

  .plyr__control:focus-visible svg {
    fill: ${(props) => props.theme.brandColor};
  }

  .plyr--full-ui input[type="range"] {
    color: ${(props) => props.theme.brandColor};
  }

  @media (max-width: 767px) {
    .plyr__time + .plyr__time {
      display: block;
    }
  }
`;

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
        "rounded-lg border border-gray-200 shadow-sm dark:border-neutral-800"
      } ${!isPreview && "mb-4"}`}
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
