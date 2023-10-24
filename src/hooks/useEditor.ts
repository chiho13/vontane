// import { useMemo, withReact, createEditor } from '../deps';

import { useEffect, useMemo, useRef } from "react";
import { ReactEditor, withReact } from "slate-react";
import {
  BaseEditor,
  createEditor,
  Editor,
  Path,
  Range,
  Transforms,
} from "slate";

import { withID } from "@/hoc/withID";
import { withHistory, HistoryEditor } from "slate-history";
import { withColumns } from "@/hoc/withColumns";
import { withNormalise, withCustomDelete } from "@/hoc/withNormalise";
import { genNodeId } from "@/hoc/withID";
import isUrl from "is-url";
import { withPasting } from "@/hoc/withPasting";
import { withImages } from "@/hoc/withImages";
interface CustomEditor extends ReactEditor {
  undo: () => void;
  redo: () => void;
}
declare module "slate" {
  interface ReactEditor extends HistoryEditor {}
}

export const useEditor = () => {
  const editor = useMemo(
    () =>
      withImages(
        withPasting(
          withCustomDelete(
            withNormalise(withHistory(withReact(createEditor())))
          )
        )
      ) as CustomEditor,
    []
  );
  return editor;
};
