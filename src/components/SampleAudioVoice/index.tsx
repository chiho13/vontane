import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { PlayCircle, StopCircle } from "lucide-react";

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
        <StopCircle className="h-8 w-8 stroke-foreground hover:stroke-brand" />
      ) : (
        <PlayCircle className="h-8 w-8 stroke-foreground hover:stroke-brand" />
      )}
    </SampleAudioVoiceStyle>
  );
};

export default SampleAudioVoice;
