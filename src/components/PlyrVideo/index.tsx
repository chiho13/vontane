import React, { useState, useEffect } from "react";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";
import styled, { useTheme } from "styled-components";
import { StyledPlyr } from "../ui/plyr";

export const PlyrYoutubePlayer = () => {
  const theme = useTheme();

  let controls = [
    "play",
    "restart",
    "progress",
    "current-time",
    "duration",
    "settings",
  ];

  return (
    <Plyr
      source={{
        type: "video",
        sources: [{ src: "WzjvJd7dqB4", provider: "youtube" }],
      }}
      options={{
        controls,
        settings: ["speed"],
        speed: { selected: 1, options: [0.7, 1, 1.25, 1.5, 2] },
      }}
    />
  );
};
