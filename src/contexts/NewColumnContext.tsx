import { createContext, useContext, useState, ReactNode } from "react";

interface NewColumnContextType {
  creatingNewColumn: boolean;
  setCreatingNewColumn: (creatingNewColumn: boolean) => void;
}

const NewColumnContext = createContext<NewColumnContextType>({
  creatingNewColumn: false,
  setCreatingNewColumn: () => {},
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

  return (
    <NewColumnContext.Provider
      value={{ creatingNewColumn, setCreatingNewColumn }}
    >
      {children}
    </NewColumnContext.Provider>
  );
};
