import { createContext, useContext, useState, ReactNode } from "react";

interface NewColumnContextType {
  creatingNewColumn: boolean;
  setCreatingNewColumn: (creatingNewColumn: boolean) => void;
  insertDirection: "left" | "right" | "up" | "down" | null;
  setInsertDirection: (
    direction: "left" | "right" | "up" | "down" | null
  ) => void;
}

const NewColumnContext = createContext<NewColumnContextType>({
  creatingNewColumn: false,
  setCreatingNewColumn: () => {},
  insertDirection: null,
  setInsertDirection: () => {},
});

export const useNewColumn = (): NewColumnContextType => {
  return useContext(NewColumnContext);
};

interface NewColumnProviderProps {
  children: ReactNode;
}

export const NewColumnProvider: React.FC<NewColumnProviderProps> = ({
  children,
}) => {
  const [creatingNewColumn, setCreatingNewColumn] = useState(false);
  const [insertDirection, setInsertDirection] = useState<
    "left" | "right" | "up" | "down" | null
  >(null);

  return (
    <NewColumnContext.Provider
      value={{
        creatingNewColumn,
        setCreatingNewColumn,
        insertDirection,
        setInsertDirection,
      }}
    >
      {children}
    </NewColumnContext.Provider>
  );
};
