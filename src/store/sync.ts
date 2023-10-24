import { create } from "zustand";

type SyncStatusState = {
  syncStatus: "idle" | "syncing" | "synced";
  setSyncStatus: (value: "idle" | "syncing" | "synced") => void;
};

export const syncStatusStore = create<SyncStatusState>((set) => ({
  syncStatus: "idle",
  setSyncStatus: (value) => set({ syncStatus: value }),
}));
