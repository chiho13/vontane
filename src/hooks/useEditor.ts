// import { useMemo, withReact, createEditor } from '../deps';

import { useMemo, useRef } from "react";
import { withReact } from "slate-react";
import { createEditor, Editor, Path, Range, Transforms } from "slate";

import { withID } from "@/hoc/withID";
import { withHistory } from "slate-history";
import { withColumns } from "@/hoc/withColumns";
import { withTitle, withCustomDelete } from "@/hoc/withTitle";
import { genNodeId } from "@/hoc/withID";
import isUrl from "is-url";
import { withNormalizePasting } from "@/hoc/withPasting";

export function useEditor() {
  const editor = useMemo(
    () =>
      withNormalizePasting(
        withCustomDelete(withTitle(withHistory(withReact(createEditor()))))
      ),
    []
  );
  return editor;
}

// export function useEditor() {
//   const editorRef = useRef();
//   if (!editorRef.current)
//     editorRef.current = withNormalizePasting(
//       withTitle(withHistory(withColumns(withReact(createEditor()))))
//     );

//   return editorRef.current;
// }
