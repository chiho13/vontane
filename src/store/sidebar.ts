// store.js
import { create } from "zustand";

export const sideBarStore = create((set) => ({
  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: time }),
}));
