import React from "react";
import { saveAs } from "file-saver";
import { Download } from "@/icons/Download";
import styled, { useTheme } from "styled-components";
import { downloadAudio } from "../../api/downloadApi";

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
    <button
      className="ml-4 flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md outline-none hover:bg-gray-50 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
      onClick={handleDownload}
    >
      <Download theme={theme} />
      <span className="ml-2 inline-block">Download</span>
    </button>
  );
}
