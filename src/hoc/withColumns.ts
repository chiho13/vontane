import {
  Transforms,
  Editor,
  Range,
  Point,
  Element as SlateElement,
} from "slate";
import { genNodeId } from "./withID";

export const withColumns = (editor: any) => {
  const { insertBreak, deleteBackward } = editor;

  editor.insertBreak = () => {
    const { selection } = editor;
    if (selection) {
      const [start] = Range.edges(selection);
      const cellEntry = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && n.type === "column-cell",
      });
      if (cellEntry) {
        const [, cellPath] = cellEntry;
        const [table, tablePath] = Editor.parent(editor, cellPath);
        const colIndex = cellPath[cellPath.length - 1];

        if (colIndex === 0) {
          const newRow = Array.from(
            { length: table.children.length },
            (_, index) => ({
              id: `${genNodeId()}${index}`,
              type: "column-cell",
              children: [
                { type: "paragraph", align: "start", children: [{ text: "" }] },
              ],
            })
          );
          Transforms.insertNodes(editor, newRow, {
            at: tablePath.concat(table.children.length),
          });
        }
      }
    }
    insertBreak();
  };

  editor.deleteBackward = (unit: any) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "column-cell",
      });

      if (cell) {
        const [cellNode, cellPath] = cell;
        const start = Editor.start(editor, cellPath);

        if (Point.equals(selection.anchor, start)) {
          return;
        }
      }
    }

    deleteBackward(unit);
  };

  return editor;
};
