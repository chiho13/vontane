import React, { createContext, useState, FunctionComponent } from "react";

type AudioContextType = {
  playAudio: (audio: HTMLAudioElement) => void;
  pauseAudio: () => void;
};

const defaultAudioContext: AudioContextType = {
  playAudio: () => {},
  pauseAudio: () => {},
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
