import useTextSpeechStatusPolling from "@/hooks/useTextSpeechAPI";
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
import { useLocalStorage } from "usehooks-ts";

// Define the shape of the context object

type AudioData = {
  audio_url: string;
  file_name: string;
  content: string;
};
interface TextSpeechContextType {
  audioData: AudioData;
  setAudioData: (value: AudioData) => void;
  showRightSidebar: boolean;
  setShowRightSidebar: (value: boolean) => void;
  rightBarAudioIsLoading: boolean;
  setRightBarAudioIsLoading: (value: boolean) => void;
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
  rightBarAudioIsLoading: false,
  setRightBarAudioIsLoading: () => {},
});

// Define the shape of the provider props
interface TextSpeechProviderProps {
  children: ReactNode;
}

// Create a custom hook to use the context
const useTextSpeech = () => {
  return useContext(TextSpeechContext);
};

const RightSideBarProvider = ({ children }: TextSpeechProviderProps) => {
  const [audioData, setAudioData] = useState({
    audio_url: "",
    file_name: "",
    content: "",
  });
  const [showRightSidebar, setShowRightSidebar] = useLocalStorage(
    "showRightSidebar",
    true
  );
  const [rightBarAudioIsLoading, setRightBarAudioIsLoading] =
    useState<boolean>(false);

  return (
    <TextSpeechContext.Provider
      value={{
        audioData,
        setAudioData,
        showRightSidebar,
        setShowRightSidebar,
        rightBarAudioIsLoading,
        setRightBarAudioIsLoading,
      }}
    >
      {children}
    </TextSpeechContext.Provider>
  );
};

export { RightSideBarProvider, useTextSpeech };
