import React, { createContext, useContext, PropsWithChildren } from "react";
import { MouseEvent } from "react";
import { Path } from "slate";
import { Editor } from "slate";

// Create the EquationContext with the correct function signature
const EquationContext = createContext<{
  editor: Editor;
}>({
  editor: null as any,
});

// Define the EquationProviderProps type
type EquationProviderProps = PropsWithChildren<{
  editor: Editor;
}>;

// Create an EquationProvider component that accepts a `children` prop and the `openEditBlockPopup` function
const EquationProvider: React.FC<EquationProviderProps> = ({
  children,
  editor,
}) => {
  return (
    <EquationContext.Provider value={{ editor }}>
      {children}
    </EquationContext.Provider>
  );
};

// Export the EquationProvider and the EquationContext
export { EquationProvider, EquationContext };
