import React from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import styled, { useTheme } from "styled-components";

const StyledPlyr = styled.div`
  .plyr--audio .plyr__controls {
    background: transparent !important;
  }

  .plyr--audio .plyr__control:hover,
  .plyr--audio .plyr__control[aria-expanded="true"] {
    background: ${(props) => props.theme.brandColor} !important;
  }

  .plyr__control svg {
    fill: ${(props) => props.theme.brandColor} !important;
  }

  .plyr--audio .plyr__control {
    border-radius: 8px !important;
    .dark & {
      background: #f1f1f1 !important;
    }
  }

  .plyr--audio .plyr__control:hover,
  .plyr--audio .plyr__control[aria-expanded="true"] {
    .dark & {
      background: ${(props) => props.theme.brandColor} !important;
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
    color: ${(props) => props.theme.brandColor} !important;
  }
`;

export const PlyrAudioPlayer = ({ audioURL, content, isPreview = false }) => {
  const theme = useTheme();
  const controls =
    content.length < 40
      ? ["play"]
      : ["play", "restart", "progress", "current-time", "settings"];

  return (
    <StyledPlyr theme={theme}>
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
