import React, { createContext, useContext, PropsWithChildren } from "react";
import { MouseEvent } from "react";
import { Path } from "slate";
import { Editor } from "slate";

// Create the EditorContext with the correct function signature
const EditorContext = createContext<{
  editor: Editor;
}>({
  editor: null as any,
});

// Define the EquationProviderProps type
type EquationProviderProps = PropsWithChildren<{
  editor: Editor;
}>;

// Create an EquationProvider component that accepts a `children` prop and the `openEditBlockPopup` function
const EditorProvider: React.FC<EquationProviderProps> = ({
  children,
  editor,
}) => {
  return (
    <EditorContext.Provider value={{ editor }}>
      {children}
    </EditorContext.Provider>
  );
};

// Export the EquationProvider and the EditorContext
export { EditorProvider, EditorContext };
