import { create } from "zustand";

type State = {
  editor: any;
  set: (value: { editor: any }) => void;
};

export const editorStore = create<State>((set) => ({
  editor: null,
  set: (value) => set(value),
}));
