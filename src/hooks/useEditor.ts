// import { useMemo, withReact, createEditor } from '../deps';

import { useMemo, useRef } from "react";
import { withReact } from "slate-react";
import { createEditor, Editor, Path, Range, Transforms } from "slate";

import { withID } from "@/hoc/withID";
import { withHistory } from "slate-history";
import { withColumns } from "@/hoc/withColumns";
import { withTitle } from "@/hoc/withTitle";
import { genNodeId } from "@/hoc/withID";

const withNormalizePasting = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const text = data.getData("text/plain");

    if (text) {
      const lines = text.split(/\r\n|\r|\n/);

      // Wrap each line in a paragraph node and remove empty lines
      const nodesToInsert = lines.map((line) => ({
        id: genNodeId(),
        type: "paragraph",
        children: [{ text: line }],
      }));

      // If there are valid nodes to insert, insert them as a fragment
      if (nodesToInsert.length > 0) {
        Transforms.insertFragment(editor, nodesToInsert);
      }
    } else {
      insertData(data);
    }
  };

  return editor;
};

// export function useEditor() {
//   const editor = useMemo(
//     () =>
//       withNormalizePasting(
//         withTitle(withHistory(withColumns(withReact(createEditor()))))
//       ),
//     []
//   );
//   return editor;
// }

export function useEditor() {
  const editorRef = useRef();
  if (!editorRef.current)
    editorRef.current = withNormalizePasting(
      withTitle(withHistory(withColumns(withReact(createEditor()))))
    );

  return editorRef.current;
}
