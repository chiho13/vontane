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
import { Button } from "../ui/button";

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
    <Button
      onClick={handleDownload}
      variant="outline"
      size="sm"
      className={cn(
        "group flex items-center justify-center gap-2 border border-gray-300 bg-white px-3 py-2 text-sm font-medium outline-none transition duration-200 hover:bg-gray-200 focus:outline-none  focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50 dark:border-gray-700 dark:bg-muted dark:hover:bg-accent dark:hover:text-white ",
        className
      )}
    >
      <span>Download</span>
      <Download
        strokeWidth={2}
        className={cn(
          "h-4 w-4 stroke-foreground dark:stroke-white",
          iconClassName
        )}
      />
    </Button>
  );
}
