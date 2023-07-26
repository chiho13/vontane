import { useRouter } from "next/router";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  Dispatch,
  useCallback,
} from "react";

import React from "react";
import { useLocalStorage } from "usehooks-ts";

// Define the shape of the context object

type AudioData = {
  audio_url: string;
  file_name: string;
  content: string;
  transcript?: any;
};
interface TextSpeechContextType {
  audioData: AudioData;
  setAudioData: (value: AudioData) => void;
  showRightSidebar: boolean;
  setShowRightSidebar: (value: boolean) => void;
  rightBarAudioIsLoading: Record<string, boolean>;
  setRightBarAudioIsLoading: (value: Record<string, boolean>) => void;
  generatedAudio: HTMLAudioElement | null;
  setGenerateAudio: (value: HTMLAudioElement) => void;
  isPlaying: boolean;
  setIsPlaying: (value: boolean) => void;
  workspaceData: any;
  refetchWorkspaceData: any;
  tab: any;
  setTab: any;
}
// Create the context with default values
const TextSpeechContext = createContext<TextSpeechContextType>({
  audioData: {
    audio_url: "",
    file_name: "",
    content: "",
  },
  setAudioData: () => {},
  showRightSidebar: false,
  setShowRightSidebar: () => {},
  rightBarAudioIsLoading: {},
  setRightBarAudioIsLoading: () => {},
  generatedAudio: null,
  setGenerateAudio: () => {},
  isPlaying: false,
  setIsPlaying: () => {},
  workspaceData: {},
  refetchWorkspaceData: {},
  tab: {},
  setTab: () => {},
});

// Define the shape of the provider props
interface TextSpeechProviderProps {
  children: ReactNode;
  workspaceData: any;
  refetchWorkspaceData: any;
}

// Create a custom hook to use the context
const useTextSpeech = () => {
  return useContext(TextSpeechContext);
};

const RightSideBarProvider = ({
  children,
  workspaceData,
  refetchWorkspaceData,
}: TextSpeechProviderProps) => {
  const [audioData, setAudioData] = useState({
    audio_url: "",
    file_name: "",
    content: "",
  });
  const [showRightSidebar, setShowRightSidebar] = useLocalStorage(
    "showRightSidebar",
    true
  );
  const [rightBarAudioIsLoading, setRightBarAudioIsLoading] = useState<
    Record<string, boolean>
  >({});
  const [generatedAudio, setGenerateAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [tab, setTab] = useLocalStorage("tab", "properties");

  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <TextSpeechContext.Provider
      value={{
        audioData,
        setAudioData,
        showRightSidebar,
        setShowRightSidebar,
        rightBarAudioIsLoading,
        setRightBarAudioIsLoading,
        generatedAudio,
        setGenerateAudio,
        isPlaying,
        setIsPlaying,
        workspaceData,
        refetchWorkspaceData,
        tab,
        setTab,
      }}
    >
      {children}
    </TextSpeechContext.Provider>
  );
};

export { RightSideBarProvider, useTextSpeech };
