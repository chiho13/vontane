import React, { FunctionComponent } from "react";
import styled from "styled-components";

const SampleAudioVoiceStyle = styled.button`
  margin-right: 20px;
`;

interface SampleAudioVoiceProps {
  isPlaying: boolean;
  playAudio: () => void;
  stopAudio: () => void;
}

const SampleAudioVoice: FunctionComponent<SampleAudioVoiceProps> = ({
  isPlaying,
  playAudio,
  stopAudio,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };
  return (
    <SampleAudioVoiceStyle
      tabIndex={0}
      role="button"
      aria-label={isPlaying ? "Stop audio" : "Play audio"}
      aria-pressed={isPlaying}
      onClick={isPlaying ? stopAudio : playAudio}
      onKeyDown={handleKeyDown}
    >
      {isPlaying ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="stop-icon w-10 h-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="play-icon w-10 h-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
          />
        </svg>
      )}
    </SampleAudioVoiceStyle>
  );
};

export default SampleAudioVoice;
