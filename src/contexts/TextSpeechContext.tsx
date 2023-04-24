import useTextSpeechStatusPolling from "@/hooks/useTextSpeechAPI";
import { useRouter } from "next/router";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  Dispatch,
} from "react";

// Define the shape of the context object
interface TextSpeechContextType {
  textSpeech: string[];
  setTextSpeech: (textSpeech: string[]) => void;
  generatedAudioElement: HTMLAudioElement | null;
  setGeneratedAudioElement: Dispatch<SetStateAction<HTMLAudioElement | null>>;
  audioIsLoading: boolean;
  setAudioIsLoading: (value: boolean) => void;
  uploadedFileName: string;
}

// Create the context with default values
const TextSpeechContext = createContext<TextSpeechContextType>({
  textSpeech: [""],
  setTextSpeech: () => {},
  generatedAudioElement: null,
  setGeneratedAudioElement: () => {},
  audioIsLoading: false,
  setAudioIsLoading: () => {},
  uploadedFileName: "",
});

// Define the shape of the provider props
interface TextSpeechProviderProps {
  children: ReactNode;
}

// Create a custom hook to use the context
const useTextSpeech = () => {
  return useContext(TextSpeechContext);
};

const TextSpeechProvider = ({ children }: TextSpeechProviderProps) => {
  const router = useRouter();
  const workspaceId = router.query.workspaceId;
  const [textSpeech, setTextSpeech] = useState<string[]>([""]);
  const [audioIsLoading, setAudioIsLoading] = useState<boolean>(false);
  const [generatedAudioElement, setGeneratedAudioElement, uploadedFileName] =
    useTextSpeechStatusPolling(setAudioIsLoading, workspaceId); // Replace `workspaceId` with the actual workspace ID.

  return (
    <TextSpeechContext.Provider
      value={{
        textSpeech,
        setTextSpeech,
        generatedAudioElement,
        setGeneratedAudioElement,
        audioIsLoading,
        setAudioIsLoading,
        uploadedFileName,
      }}
    >
      {children}
    </TextSpeechContext.Provider>
  );
};

export { TextSpeechProvider, useTextSpeech };
