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

// Define the shape of the context object
interface TextSpeechContextType {
  textSpeech: string[];
  setTextSpeech: (textSpeech: string[]) => void;
  selectedTextSpeech: string[] | null;
  setSelectedTextSpeech: (textSpeech: string[] | null) => void;
  generatedAudioElement: HTMLAudioElement | null;
  setGeneratedAudioElement: Dispatch<SetStateAction<HTMLAudioElement | null>>;
  audioIsLoading: boolean;
  setAudioIsLoading: (value: boolean) => void;
  uploadedFileName: string | null;
  showMiniToolbar: boolean;
  setShowMiniToolbar: (value: boolean) => void;
  resetTextSpeech: () => void;
}

// Create the context with default values
const TextSpeechContext = createContext<TextSpeechContextType>({
  textSpeech: [""],
  setTextSpeech: () => {},
  selectedTextSpeech: [""],
  setSelectedTextSpeech: () => {},
  generatedAudioElement: null,
  setGeneratedAudioElement: () => {},
  audioIsLoading: false,
  setAudioIsLoading: () => {},
  uploadedFileName: "",
  showMiniToolbar: false,
  setShowMiniToolbar: () => {},
  resetTextSpeech: () => {},
});

// Define the shape of the provider props
interface TextSpeechProviderProps {
  children: ReactNode;
}

// Create a custom hook to use the context
const useTextSpeech = () => {
  return useContext(TextSpeechContext);
};

const useTextSpeechReset = () => {
  const context = useContext(TextSpeechContext);
  return context.resetTextSpeech;
};

const TextSpeechProvider = ({ children }: TextSpeechProviderProps) => {
  const router = useRouter();
  const workspaceId = router.query.workspaceId;
  const [textSpeech, setTextSpeech] = useState<string[]>([""]);
  const [selectedTextSpeech, setSelectedTextSpeech] = useState<string[] | null>(
    null
  );
  const [audioIsLoading, setAudioIsLoading] = useState<boolean>(false);
  const [generatedAudioElement, setGeneratedAudioElement, uploadedFileName] =
    useTextSpeechStatusPolling(setAudioIsLoading, workspaceId); // Replace `workspaceId` with the actual workspace ID.
  const [showMiniToolbar, setShowMiniToolbar] = useState(false);

  const resetTextSpeech = useCallback(() => {
    setTextSpeech([""]);
    setSelectedTextSpeech(null);
    setAudioIsLoading(false);
    setGeneratedAudioElement(null);
    setShowMiniToolbar(false);
  }, []);

  return (
    <TextSpeechContext.Provider
      value={{
        textSpeech,
        setTextSpeech,
        selectedTextSpeech,
        setSelectedTextSpeech,
        generatedAudioElement,
        setGeneratedAudioElement,
        audioIsLoading,
        setAudioIsLoading,
        uploadedFileName,
        showMiniToolbar,
        setShowMiniToolbar,
        resetTextSpeech,
      }}
    >
      {children}
    </TextSpeechContext.Provider>
  );
};

export { TextSpeechProvider, useTextSpeech, useTextSpeechReset };
