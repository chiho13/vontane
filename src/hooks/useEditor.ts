// import { useMemo, withReact, createEditor } from '../deps';

import { useMemo } from "react";
import { withReact } from "slate-react";
import { createEditor, Editor, Range, Transforms } from "slate";

import { withID } from "@/hoc/withID";
import { withHistory } from "slate-history";
import { withColumns } from "@/hoc/withColumns";
import { withTitle } from "@/hoc/withTitle";

export function useEditor() {
  const editor = useMemo(
    () => withTitle(withHistory(withColumns(withReact(createEditor())))),
    []
  );
  return editor;
}
