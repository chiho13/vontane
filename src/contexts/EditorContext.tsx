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
}>({
  editor: null as any,
  showEditBlockPopup: false,
  elementID: "",
  activePath: "",
});

// Define the EquationProviderProps type
type EquationProviderProps = PropsWithChildren<{
  editor: Editor;
  showEditBlockPopup: Boolean;
  elementID: string;
  activePath: string;
}>;

// Create an EquationProvider component that accepts a `children` prop and the `openEditBlockPopup` function
const EditorProvider: React.FC<EquationProviderProps> = ({
  children,
  editor,
  showEditBlockPopup,
  elementID,
  activePath,
}) => {
  return (
    <EditorContext.Provider
      value={{ editor, showEditBlockPopup, elementID, activePath }}
    >
      {children}
    </EditorContext.Provider>
  );
};

// Export the EquationProvider and the EditorContext
export { EditorProvider, EditorContext };
