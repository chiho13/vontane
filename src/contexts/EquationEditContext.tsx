import React, { createContext, useContext, PropsWithChildren } from "react";
import { MouseEvent } from "react";
import { Path } from "slate";
import { Editor } from "slate";

// Create the EquationContext with the correct function signature
const EquationContext = createContext<{
  openEditBlockPopup: (event: MouseEvent, path: Path) => void;
  editor: Editor;
}>({
  openEditBlockPopup: () => {},
  editor: null as any,
});

// Define the EquationProviderProps type
type EquationProviderProps = PropsWithChildren<{
  openEditBlockPopup: (event: MouseEvent, path: Path) => void;
  editor: Editor;
}>;

// Create an EquationProvider component that accepts a `children` prop and the `openEditBlockPopup` function
const EquationProvider: React.FC<EquationProviderProps> = ({
  children,
  openEditBlockPopup,
  editor,
}) => {
  return (
    <EquationContext.Provider value={{ openEditBlockPopup, editor }}>
      {children}
    </EquationContext.Provider>
  );
};

// Export the EquationProvider and the EquationContext
export { EquationProvider, EquationContext };
