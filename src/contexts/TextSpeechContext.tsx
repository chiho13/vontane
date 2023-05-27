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
  textSpeech: string | null;
  setTextSpeech: (textSpeech: string | null) => void;
  selectedTextSpeech: string[] | null;
  setSelectedTextSpeech: (textSpeech: string[] | null) => void;
  audioIsLoading: boolean;
  setAudioIsLoading: (value: boolean) => void;
  showMiniToolbar: boolean;
  setShowMiniToolbar: (value: boolean) => void;
  signedURL: string | null;
  setSignedURL: (value: string | null) => void;
}

// Create the context with default values
const TextSpeechContext = createContext<TextSpeechContextType>({
  textSpeech: [""],
  setTextSpeech: () => {},
  selectedTextSpeech: [""],
  setSelectedTextSpeech: () => {},
  audioIsLoading: false,
  setAudioIsLoading: () => {},
  showMiniToolbar: false,
  setShowMiniToolbar: () => {},
  signedURL: null,
  setSignedURL: () => {},
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
  const [textSpeech, setTextSpeech] = useState<string | null>(null);
  const [selectedTextSpeech, setSelectedTextSpeech] = useState<string[] | null>(
    null
  );
  const [audioIsLoading, setAudioIsLoading] = useState<boolean>(false);
  // Replace `workspaceId` with the actual workspace ID.
  const [showMiniToolbar, setShowMiniToolbar] = useState(false);
  const [signedURL, setSignedURL] = useState<string | null>(null);

  return (
    <TextSpeechContext.Provider
      value={{
        textSpeech,
        setTextSpeech,
        selectedTextSpeech,
        setSelectedTextSpeech,
        audioIsLoading,
        setAudioIsLoading,
        showMiniToolbar,
        setShowMiniToolbar,
        signedURL,
        setSignedURL,
      }}
    >
      {children}
    </TextSpeechContext.Provider>
  );
};

export { TextSpeechProvider, useTextSpeech };
