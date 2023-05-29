import React from "react";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DownloadButtonProps {
  audioURL: string | null;
  fileName: string;
}

export function DownloadButton({
  audioURL,
  fileName,
}: DownloadButtonProps): JSX.Element {
  async function handleDownload() {
    if (!audioURL) return;
    try {
      const response = await fetch(audioURL);
      const blob = await response.blob();
      saveAs(blob, fileName);
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
            onClick={handleDownload}
            className="group flex h-[24px] w-[24px] items-center justify-center rounded-full border border-gray-300 bg-white px-1 py-2 text-sm font-medium text-gray-700 outline-none transition duration-200 hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:border-white dark:bg-white dark:text-foreground "
          >
            <Download
              strokeWidth={3}
              className="w-5 stroke-darkgray group-hover:stroke-brand dark:stroke-gray-600 group-hover:dark:stroke-brand"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent
          className="border-black  dark:bg-white dark:text-muted"
          side="top"
          sideOffset={10}
        >
          <p className="text-[12px]">Download MP3</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
