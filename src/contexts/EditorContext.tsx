import React, {
  createContext,
  useContext,
  PropsWithChildren,
  useState,
  SetStateAction,
  Dispatch,
  ReactNode,
} from "react";
import { MouseEvent } from "react";
import { BaseEditor, Path, ReactEditor } from "slate";
import { Editor } from "slate";
import { useEditor } from "@/hooks/useEditor";

// Create the EditorContext with the correct function signature
const EditorContext = createContext<{
  editor: any;
  showEditBlockPopup: any;
  setShowEditBlockPopup: Dispatch<SetStateAction<any>>;
  selectedElementID: string;
  activePath: string;
  setActivePath: Dispatch<SetStateAction<string>>;
  setSelectedElementID: Dispatch<SetStateAction<string>>;
  tempBase64: any;
  setTempBase64: Dispatch<SetStateAction<any>>;
  lastActiveSelection: any;
  setLastActiveSelection: Dispatch<SetStateAction<any>>;
}>({
  editor: null as any,
  showEditBlockPopup: false,
  setShowEditBlockPopup: () => {},
  selectedElementID: "",
  activePath: "",
  setActivePath: () => {},
  setSelectedElementID: () => {},
  tempBase64: null as any,
  setTempBase64: () => {},
  lastActiveSelection: null as any,
  setLastActiveSelection: () => {},
});

// Define the EquationProviderProps type
type EquationProviderProps = PropsWithChildren<{
  children: ReactNode;
}>;

// Create an EquationProvider component that accepts a `children` prop and the `openEditBlockPopup` function
const EditorProvider: React.FC<EquationProviderProps> = ({ children }) => {
  const editor = useEditor();
  const [showEditBlockPopup, setShowEditBlockPopup] = useState({
    open: false,
    element: null,
  });
  const [selectedElementID, setSelectedElementID] = useState<string>("");
  const [activePath, setActivePath] = useState<string>("");
  const [tempBase64, setTempBase64] = useState({});
  const [lastActiveSelection, setLastActiveSelection] = useState<Range>();
  return (
    <EditorContext.Provider
      value={{
        editor,
        showEditBlockPopup,
        setShowEditBlockPopup,
        selectedElementID,
        setSelectedElementID,
        activePath,
        setActivePath,
        tempBase64,
        setTempBase64,
        lastActiveSelection,
        setLastActiveSelection,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

// Export the EquationProvider and the EditorContext
export { EditorProvider, EditorContext };
