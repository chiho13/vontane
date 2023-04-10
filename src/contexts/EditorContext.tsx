import React, { createContext, useContext, PropsWithChildren } from "react";
import { MouseEvent } from "react";
import { Path } from "slate";
import { Editor } from "slate";

// Create the EditorContext with the correct function signature
const EditorContext = createContext<{
  editor: Editor;
  showEditBlockPopup: Boolean;
  elementID: string;
  activePath: string;
  setSelectedElementID: (id: string) => void;
}>({
  editor: null as any,
  showEditBlockPopup: false,
  elementID: "",
  activePath: "",
  setSelectedElementID: () => {},
});

// Define the EquationProviderProps type
type EquationProviderProps = PropsWithChildren<{
  editor: Editor;
  showEditBlockPopup: Boolean;
  elementID: string;
  activePath: string;
  setSelectedElementID: (id: string) => void;
}>;

// Create an EquationProvider component that accepts a `children` prop and the `openEditBlockPopup` function
const EditorProvider: React.FC<EquationProviderProps> = ({
  children,
  editor,
  showEditBlockPopup,
  elementID,
  setSelectedElementID,
  activePath,
}) => {
  return (
    <EditorContext.Provider
      value={{
        editor,
        showEditBlockPopup,
        elementID,
        setSelectedElementID,
        activePath,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

// Export the EquationProvider and the EditorContext
export { EditorProvider, EditorContext };
