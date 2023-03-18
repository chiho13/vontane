import React from "react";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import styled, { useTheme } from "styled-components";
import { downloadAudio } from "../../api/downloadApi";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DownloadButtonProps {
  generatedAudio: HTMLAudioElement | null;
  transcriptionId: string;
}

export function DownloadButton({
  generatedAudio,
  transcriptionId,
}: DownloadButtonProps): JSX.Element {
  const theme = useTheme();
  async function handleDownload() {
    if (!generatedAudio) return;

    try {
      const blob = await downloadAudio(transcriptionId);
      saveAs(blob, "synthesised-audio.wav");
    } catch (error) {
      console.error(error);
      // Handle error here
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger>
          <button
            className="ml-4 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-gray-300 bg-white px-1 py-1 text-sm font-medium text-gray-700 outline-none hover:border-orange-500 hover:bg-gray-50 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
            onClick={handleDownload}
          >
            <Download color={theme.colors.darkgray} className="w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="border-black" side="right">
          <p className="text-[12px] text-white">Download</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
