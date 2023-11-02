import { create } from "zustand";

// Define a type for the store
type Store = {
  isExpanded: Record<string, boolean>;
  setIsExpanded: (value: Record<string, boolean>) => void;
};

// Create the store
export const useAccountMenuStore = create<Store>((set) => ({
  isExpanded: {},
  setIsExpanded: (value) =>
    set((state) => ({ isExpanded: { ...state.isExpanded, ...value } })),
}));
