import { genNodeId } from "@/hoc/withID";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface SlateValueItem {
  id: string;
  type: string;
  children: { text: string }[];
}

// Define the context for slateValue
const SlateValueContext = createContext<{
  slateValue: SlateValueItem[];
  setValue: React.Dispatch<React.SetStateAction<SlateValueItem[]>>;
}>({
  slateValue: [],
  setValue: () => {},
});

export function SlateValueProvider({ children }) {
  const [slateValue, setValue] = useState<SlateValueItem[]>([
    { id: genNodeId(), type: "paragraph", children: [{ text: "" }] },
  ]);

  return (
    <SlateValueContext.Provider value={{ slateValue, setValue }}>
      {children}
    </SlateValueContext.Provider>
  );
}

export function useSlateValue() {
  return useContext(SlateValueContext);
}
