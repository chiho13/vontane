// import { useMemo, withReact, createEditor } from '../deps';

import { useMemo } from "react";
import { withReact } from "slate-react";
import { createEditor, Editor, Range } from "slate";

import { withID } from "@/hoc/withID";
import { withHistory } from "slate-history";
import { withColumns } from "@/hoc/withColumns";

const withCustomDelete = (editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection && !Range.isCollapsed(selection)) {
      deleteBackward(unit);
      return;
    }

    const currentNodeEntry = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
    });
    if (!currentNodeEntry) return;
    const [currentNode, currentNodePath] = currentNodeEntry;

    if (Editor.isStart(editor, selection.anchor, currentNodePath)) {
      const prevNodeEntry = Editor.previous(editor, { at: currentNodePath });
      if (prevNodeEntry) {
        const [prevNode] = prevNodeEntry;
        if (prevNode.type === "title") {
          // Prevent deletion if the cursor is at the beginning of the next node after the title element
          return;
        }
      }
    }

    // Otherwise, use the default delete behavior
    deleteBackward(unit);
  };

  return editor;
};

export function useEditor() {
  return useMemo(
    () => withCustomDelete(withHistory(withColumns(withReact(createEditor())))),
    []
  );
}
