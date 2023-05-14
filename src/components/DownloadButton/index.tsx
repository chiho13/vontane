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
    <div className="group">
      <button
        className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border border-gray-300 bg-white px-1 py-1 text-sm font-medium text-gray-700 outline-none transition duration-200 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50 ${
          audioURL
            ? `group-hover:border-brand group-hover:bg-gray-50`
            : "cursor-not-allowed"
        }`}
        onClick={handleDownload}
      >
        <Download className="w-4 stroke-darkgray transition duration-200 group-hover:stroke-brand" />
      </button>
    </div>
  );
}
