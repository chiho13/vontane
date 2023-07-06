import { createContext, useContext } from "react";

interface ActiveContextType {
  activeIndex: number;
}

// Provide a default value for your context
const ActiveContext = createContext<ActiveContextType>({
  activeIndex: 0, // default value
});

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
