// import { useMemo, withReact, createEditor } from '../deps';

import { useMemo } from "react";
import { withReact } from "slate-react";
import { createEditor, Editor, Path, Transforms } from "slate";
import { Range } from "slate";

import { withID } from "@/hoc/withID";
import { withColumns } from "@/hoc/withColumns";

const withEmptyTextBuffer = (editor) => {
  const { insertText } = editor;

  editor.insertText = (text) => {
    insertText(text);

    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [startTextNode, startPath] = Editor.node(
        editor,
        selection.anchor.path
      );
      const currentNodeEnd = Editor.end(editor, startPath);
      const nextPath = Path.next(startPath);

      // Check if the next node exists
      try {
        Editor.node(editor, nextPath);

        if (!Editor.isEnd(editor, currentNodeEnd, startPath)) {
          const [nextNode] = Editor.node(editor, nextPath);

          if (nextNode.text !== " ") {
            const emptyBufferNode = { text: " " };
            Transforms.insertNodes(editor, emptyBufferNode, { at: nextPath });
          }
        }
      } catch (error) {
        // Next node does not exist
        if (Editor.isEnd(editor, selection.anchor, startPath)) {
          const emptyBufferNode = { text: " " };
          Transforms.insertNodes(editor, emptyBufferNode, { at: nextPath });
        }
      }
    }
  };

  return editor;
};

export function useEditor() {
  return useMemo(() => withColumns(withReact(createEditor())), []);
}
