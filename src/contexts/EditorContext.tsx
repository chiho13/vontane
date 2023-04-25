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
import { Path } from "slate";
import { Editor } from "slate";
import { useEditor } from "@/hooks/useEditor";

// Create the EditorContext with the correct function signature
const EditorContext = createContext<{
  editor: Editor;
  showEditBlockPopup: Boolean;
  setShowEditBlockPopup: Dispatch<SetStateAction<boolean>>;
  selectedElementID: string;
  activePath: string;
  setActivePath: Dispatch<SetStateAction<string>>;
  setSelectedElementID: Dispatch<SetStateAction<string>>;
}>({
  editor: null as any,
  showEditBlockPopup: false,
  setShowEditBlockPopup: () => {},
  selectedElementID: "",
  activePath: "",
  setActivePath: () => {},
  setSelectedElementID: () => {},
});

// Define the EquationProviderProps type
type EquationProviderProps = PropsWithChildren<{
  children: ReactNode;
  editor: Editor;
}>;

// Create an EquationProvider component that accepts a `children` prop and the `openEditBlockPopup` function
const EditorProvider: React.FC<EquationProviderProps> = ({
  children,
  editor,
}) => {
  const [showEditBlockPopup, setShowEditBlockPopup] = useState(false);
  const [selectedElementID, setSelectedElementID] = useState<string>("");
  const [activePath, setActivePath] = useState<string>("");
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
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

// Export the EquationProvider and the EditorContext
export { EditorProvider, EditorContext };
