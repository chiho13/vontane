import React from "react";
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
    background: ${(props) => props.theme.brandColor};
  }

  .plyr__control:focus-visible {
    outline: 2px dashed ${(props) => props.theme.brandColor};
  }
  .plyr__control svg {
    fill: ${(props) => props.theme.brandColor};
  }

  .plyr--audio .plyr__control {
    border-radius: 8px;
  }

  .plyr__control svg {
    .dark & {
      fill: #f1f1f1;
    }
  }

  .plyr--audio .plyr__control:hover,
  .plyr--audio .plyr__control[aria-expanded="true"] {
    .dark & {
      background: ${(props) => props.theme.brandColor};
    }
  }

  .plyr__time {
    .dark & {
      color: #ffffff;
    }
  }

  .plyr__control:hover svg {
    fill: #f1f1f1 !important;
  }

  .plyr--audio .plyr__control[aria-expanded="true"] svg {
    fill: #f1f1f1 !important;
  }

  .plyr__control:focus-visible svg {
    fill: #f1f1f1 !important;
  }

  .plyr--full-ui input[type="range"] {
    color: ${(props) => props.theme.brandColor};
  }
`;

export const PlyrAudioPlayer = ({ audioURL, content, isPreview = false }) => {
  const theme = useTheme();

  let controls;

  if (isPreview) {
    controls = ["play", "progress", "current-time"];
  } else if (content.length < 40) {
    controls = ["play"];
  } else {
    controls = ["play", "restart", "progress", "current-time", "settings"];
  }

  return (
    <StyledPlyr
      theme={theme}
      className={`${
        !isPreview &&
        content.length > 40 &&
        "mb-4 rounded-lg border border-gray-300"
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
