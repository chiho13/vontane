import React from "react";
import { saveAs } from "file-saver";
import { Download } from "~/src/icons/Download";
import styled, { useTheme } from "styled-components";
import { downloadAudio } from "../../api/downloadApi";

interface DownloadButtonProps {
  generatedAudio: HTMLAudioElement | null;
  transcriptionId: string;
}

const DownloadButtonStyle = styled.button`
  margin-left: 20px;
  border-width: 1px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
`;

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
    <DownloadButtonStyle
      className="flex items-center justify-center rounded-md border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50 focus-visible:outline-none"
      onClick={handleDownload}
    >
      <Download theme={theme} />
      <span className="inline-block ml-2">Download</span>
    </DownloadButtonStyle>
  );
}
