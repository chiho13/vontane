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

const withNormalizePasting = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const text = data.getData("text/plain");

    if (text) {
      const lines = text.split(/\r\n|\r|\n/);

      // Wrap each line in a paragraph node and remove empty lines
      const nodesToInsert = lines
        .filter((line) => line.trim().length > 0)
        .map((line) => ({
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

const wrapLink = (editor, url: string) => {
  // if (isLinkActive(editor)) {
  //   unwrapLink(editor)
  // }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: "link",
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

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
