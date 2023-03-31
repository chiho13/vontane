import { createContext, useContext, useState } from "react";

const NewColumnContext = createContext({});

export const useNewColumn = () => {
  return useContext(NewColumnContext);
};

export const NewColumnProvider = ({ children }) => {
  const [creatingNewColumn, setCreatingNewColumn] = useState(false);

  return (
    <NewColumnContext.Provider
      value={{ creatingNewColumn, setCreatingNewColumn }}
    >
      {children}
    </NewColumnContext.Provider>
  );
};
