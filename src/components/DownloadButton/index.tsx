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
          <a
            href="#"
            onClick={handleDownload}
            className={cn(
              "group flex h-[30px] w-[30px] items-center justify-center rounded-md border border-neutral-200 bg-white px-1 py-2 text-sm font-medium text-gray-700 outline-none transition duration-200  hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:border-neutral-700 dark:bg-muted dark:text-foreground dark:hover:bg-accent",
              className
            )}
          >
            <Download
              strokeWidth={2}
              className={cn(
                "h-4 w-4 stroke-muted-foreground dark:stroke-foreground",
                iconClassName
              )}
            />
          </a>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={10}>
          <p className="text-[12px]">Download</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
