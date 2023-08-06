import React from "react";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/utils/cn";

interface DownloadButtonProps {
  url: string | null;
  fileName: string;
  className?: string;
  iconClassName?: string;
}

export function DownloadButton({
  url,
  fileName,
  className,
  iconClassName,
}: DownloadButtonProps): JSX.Element {
  async function handleDownload() {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, fileName);
    } catch (error) {
      console.error(error);
      // Handle error here
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger>
          <button
            onClick={handleDownload}
            className={cn(
              "group flex h-[24px] w-[24px] items-center justify-center rounded-full border border-muted-foreground bg-white px-1 py-2 text-sm font-medium text-gray-700 outline-none transition duration-200  hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:border-white dark:bg-white dark:text-foreground",
              className
            )}
          >
            <Download
              strokeWidth={2}
              className={cn(
                "h-4 w-4 stroke-muted-foreground dark:stroke-gray-600",
                iconClassName
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={10}>
          <p className="text-[12px]">Download</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
