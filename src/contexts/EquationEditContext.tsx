import React, { createContext, useContext, PropsWithChildren } from "react";
import { MouseEvent } from "react";
import { Path } from "slate";

// Create the EquationContext with the correct function signature
const EquationContext = createContext<{
  openEditBlockPopup: (event: MouseEvent, path: Path) => void;
}>({
  openEditBlockPopup: () => {},
});

// Define the EquationProviderProps type
type EquationProviderProps = PropsWithChildren<{
  openEditBlockPopup: (event: MouseEvent, path: Path) => void;
}>;

// Create an EquationProvider component that accepts a `children` prop and the `openEditBlockPopup` function
const EquationProvider: React.FC<EquationProviderProps> = ({
  children,
  openEditBlockPopup,
}) => {
  return (
    <EquationContext.Provider value={{ openEditBlockPopup }}>
      {children}
    </EquationContext.Provider>
  );
};

// Export the EquationProvider and the EquationContext
export { EquationProvider, EquationContext };
