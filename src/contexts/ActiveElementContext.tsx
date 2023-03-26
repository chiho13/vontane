import { createContext, useContext } from "react";

const ActiveContext = createContext({});

export function ActiveElementProvider({ activeIndex, children }) {
  return (
    <ActiveContext.Provider value={{ activeIndex }}>
      {children}
    </ActiveContext.Provider>
  );
}

export function useActiveElement() {
  return useContext(ActiveContext);
}
