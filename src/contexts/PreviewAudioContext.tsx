import React, {
  createContext,
  useState,
  FunctionComponent,
  useEffect,
  SetStateAction,
} from "react";

type Transcript = string;

type SearchWordTimestamp = { start: number; end: number }[];

type AudioContextType = {
  playAudio: (audio: HTMLAudioElement) => void;
  pauseAudio: () => void;
  timestamps: SearchWordTimestamp;
  setTimestamps: (value: SearchWordTimestamp) => void;
  transcript: Transcript;
  setTranscript: (value: Transcript) => void;
  selectedOption: any;
  setSelectedOption: any;
};

const defaultAudioContext: AudioContextType = {
  playAudio: () => {},
  pauseAudio: () => {},
  timestamps: [],
  setTimestamps: () => {},
  transcript: "", // default value for transcript
  setTranscript: () => {}, // adjust setter
  selectedOption: false,
  setSelectedOption: () => {},
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
  const [transcript, setTranscript] = useState<Transcript>(""); // adjust useState
  const [selectedOption, setSelectedOption] = useState(false);
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

  // useEffect(() => {
  //   if (currentAudio && timestamps.length > 0) {
  //     currentAudio.currentTime = timestamps[0].start; // assuming timestamps is an array of objects with start and end properties
  //     currentAudio.play();

  //     const intervalId = setInterval(() => {
  //       if (currentAudio.currentTime >= timestamps[0].end) {
  //         currentAudio.pause();
  //         clearInterval(intervalId);
  //       }
  //     }, 1000); // checks every second

  //     return () => clearInterval(intervalId);
  //   }
  // }, [timestamps, currentAudio]);

  return (
    <AudioManagerContext.Provider
      value={{
        timestamps,
        setTimestamps,
        playAudio,
        pauseAudio,
        transcript,
        setTranscript,
        selectedOption,
        setSelectedOption,
      }}
    >
      {children}
    </AudioManagerContext.Provider>
  );
};
