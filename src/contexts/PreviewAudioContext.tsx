import React, { createContext, useState, FunctionComponent } from "react";

type SearchWordTimestamp = { start: number; end: number }[];

type AudioContextType = {
  playAudio: (audio: HTMLAudioElement) => void;
  pauseAudio: () => void;
  timestamps: SearchWordTimestamp;
  setTimestamps: (value: SearchWordTimestamp) => void;
};

const defaultAudioContext: AudioContextType = {
  playAudio: () => {},
  pauseAudio: () => {},
  timestamps: [],
  setTimestamps: () => {},
};

export const AudioManagerContext =
  createContext<AudioContextType>(defaultAudioContext);

type AudioManagerProviderProps = {
  children: React.ReactNode;
};

export const AudioManagerProvider: FunctionComponent<
  AudioManagerProviderProps
> = ({ children }) => {
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [timestamps, setTimestamps] = useState<SearchWordTimestamp>([]);

  const playAudio = (audio: HTMLAudioElement) => {
    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause();
    }
    setCurrentAudio(audio);
    audio.play();
  };

  const pauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
    }
  };

  return (
    <AudioManagerContext.Provider
      value={{
        playAudio,
        pauseAudio,
      }}
    >
      {children}
    </AudioManagerContext.Provider>
  );
};
