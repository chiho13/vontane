// store.js
import { create } from "zustand";

type Store = {
  currentTime: number;
  audioPointData: any; // Replace 'any' with the actual type of your data
  setCurrentTime: (time: number) => void;
  setAudioPointData: (data: any) => void; // Replace 'any' with the actual type of your data
};

export const sideBarStore = create<Store>((set) => ({
  currentTime: 0,
  audioPointData: null,
  setCurrentTime: (time) => set({ currentTime: time }),
  setAudioPointData: (data) => set({ audioPointData: data }),
}));
