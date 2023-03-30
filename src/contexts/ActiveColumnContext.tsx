import React, { createContext, useContext, ReactNode } from "react";

type ActiveColumnContextProps = {
  activeColumnIndex: number | null;
  overColumnIndex: number | null;
  dragDirection: "up" | "down" | null;
};

const ActiveColumnContext = createContext<ActiveColumnContextProps | undefined>(
  undefined
);

type ActiveColumnProviderProps = {
  children: ReactNode;
  activeColumnIndex: number | null;
  overColumnIndex: number | null;
  dragDirection: "up" | "down" | null;
};

export function ActiveColumnProvider({
  children,
  activeColumnIndex,
  overColumnIndex,
  dragDirection,
}: ActiveColumnProviderProps) {
  return (
    <ActiveColumnContext.Provider
      value={{ activeColumnIndex, overColumnIndex, dragDirection }}
    >
      {children}
    </ActiveColumnContext.Provider>
  );
}

export function useActiveColumn() {
  const context = useContext(ActiveColumnContext);
  if (!context) {
    throw new Error(
      "useActiveColumn must be used within an ActiveColumnProvider"
    );
  }
  return context;
}
