import { genNodeId } from "@/hoc/withID";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

// interface SlateValueItem {
//   id: string;
//   type: string;
//   column1: Object;
//   column2: Object;
//   children: any;
// }

// Define the context for slateValue
const SlateValueContext = createContext<{
  slateValue: any;
  setValue: () => void;
}>({
  slateValue: [],
  setValue: () => {},
});

export function SlateValueProvider({ children }) {
  //   const [slateValue, setValue] = useState<SlateValueItem[]>([
  //     { id: genNodeId(), type: "paragraph", children: [{ text: "" }] },
  //   ]);

  const [slateValue, setValue] = useState([
    { id: genNodeId(), type: "paragraph", children: [{ text: "" }] },
    {
      id: genNodeId(),
      type: "twoColumns",
      children: [
        {
          id: genNodeId(),
          type: "column",
          children: [
            {
              id: genNodeId(),
              type: "paragraph",
              children: [{ text: "Column 1, Paragraph 1" }],
            },
            {
              id: genNodeId(),
              type: "paragraph",
              children: [{ text: "Column 1, Paragraph 2" }],
            },
          ],
        },
        {
          id: genNodeId(),
          type: "column",
          children: [
            {
              id: genNodeId(),
              type: "paragraph",
              children: [{ text: "Column 2, Paragraph 1" }],
            },
            {
              id: genNodeId(),
              type: "paragraph",
              children: [{ text: "Column 2, Paragraph 2" }],
            },
          ],
        },
      ],
    },
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
