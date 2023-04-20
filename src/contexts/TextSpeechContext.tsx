import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the context object
interface TextSpeechContextType {
  textSpeech: string[];
  setTextSpeech: (textSpeech: string[]) => void;
}

// Create the context with default values
const TextSpeechContext = createContext<TextSpeechContextType>({
  textSpeech: [""],
  setTextSpeech: () => {},
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
  const [textSpeech, setTextSpeech] = useState<string[]>([""]);

  return (
    <TextSpeechContext.Provider value={{ textSpeech, setTextSpeech }}>
      {children}
    </TextSpeechContext.Provider>
  );
};

export { TextSpeechProvider, useTextSpeech };
