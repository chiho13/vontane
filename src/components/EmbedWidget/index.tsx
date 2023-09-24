import React, { useEffect, useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { AudioManagerProvider } from "@/contexts/PreviewAudioContext";
import { Button } from "@/components/ui/button";
import { parseNodes } from "@/utils/renderHelpers";

import { ThemeProvider } from "styled-components";

export const WidgetRenderer = ({
  workspaceData,
  font,
  brandColor,
  isWidget = false,
}) => {
  const [localValue, setLocalValue] = useState(null);

  const [currentTheme, setCurrentTheme] = useState({
    brandColor: "#0E78EF", // initial default value
    accentColor: "#e9e9e9",
  });

  console.log(workspaceData);

  useEffect(() => {
    if (workspaceData) {
      const parsedSlateValue = JSON.parse(workspaceData);
      setLocalValue(parsedSlateValue);
    }

    return () => {
      setLocalValue(null);
    };
  }, [workspaceData]);

  useEffect(() => {
    if (brandColor) {
      setCurrentTheme({
        brandColor,
        accentColor: "#e9e9e9",
      });
    }
  }, [brandColor]);

  if (!workspaceData) {
    // Show 404 page if workspaceId is not found
    return (
      <div className="flex h-[100vh] w-full flex-col items-center justify-center">
        <div className="text-bold mb-2 text-8xl">404</div>
        <p className="text-2xl">Widget not found</p>
      </div>
    );
  }

  return (
    localValue && (
      <ThemeProvider theme={currentTheme}>
        <AudioManagerProvider>
          <div className="published">
            <div
              className={`relative  overflow-y-auto bg-white  dark:bg-[#191919] `}
            >
              <div className=" relative mx-auto mb-4 max-w-[580px]">
                {parseNodes(localValue, font)}
              </div>
            </div>

            <div className="fixed right-4 top-4  z-10  hidden gap-2 xl:flex">
              {/* <button onClick={handleToggleView}>Toggle View</button> */}

              {!isWidget && <ModeToggle side="bottom" />}
            </div>
          </div>
        </AudioManagerProvider>
      </ThemeProvider>
    )
  );
};
