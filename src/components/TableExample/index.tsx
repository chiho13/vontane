import React, { useState, useCallback, useMemo } from "react";
import { Slate, Editable, withReact } from "slate-react";
import {
  createEditor,
  Transforms,
  Editor,
  Range,
  Point,
  Element as SlateElement,
} from "slate";
import { withHistory } from "slate-history";

const ColumnLayoutExample = () => {
  const editor = useMemo(
    () => withColumns(withHistory(withReact(createEditor()))),
    []
  );
  const [value, setValue] = useState(initialValue);

  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  return (
    <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
      <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
    </Slate>
  );
};

const withColumns = (editor) => {
  const { insertBreak, deleteBackward } = editor;

  editor.insertBreak = () => {
    const { selection } = editor;
    if (selection) {
      const [start] = Range.edges(selection);
      const cellEntry = Editor.above(editor, {
        match: (n) => n.type === "column-cell",
      });
      if (cellEntry) {
        const [, cellPath] = cellEntry;
        const [table, tablePath] = Editor.parent(editor, cellPath);
        const colIndex = cellPath[cellPath.length - 1];

        if (colIndex === 0) {
          const newRow = Array.from({ length: table.children.length }, () => ({
            type: "column-cell",
            children: [{ type: "paragraph", children: [{ text: "" }] }],
          }));
          Transforms.insertNodes(editor, newRow, {
            at: tablePath.concat(table.children.length),
          });
        }
      }
    }
    insertBreak();
  };

  editor.deleteBackward = (unit) => {
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

const Element = (props) => {
  const { attributes, children, element } = props;
  switch (element.type) {
    case "column":
      return (
        <div
          {...attributes}
          className="flex items-start justify-center gap-4 border-b pb-4"
        >
          {children}
        </div>
      );
    case "column-cell":
      return (
        <div {...attributes} className="flex-1 rounded border p-2">
          {children}
        </div>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  return <span {...attributes}>{children}</span>;
};

const initialValue = [
  {
    type: "column",
    children: [
      {
        type: "column-cell",
        children: [
          {
            type: "paragraph",
            children: [{ text: "Paragraph 1 in column 1" }],
          },
          {
            type: "paragraph",
            children: [{ text: "Paragraph 2 in column 1" }],
          },
        ],
      },
      {
        type: "column-cell",
        children: [
          {
            type: "paragraph",
            children: [{ text: "Paragraph 1 in column 2" }],
          },
          {
            type: "paragraph",
            children: [{ text: "Paragraph 2 in column 2" }],
          },
        ],
      },
    ],
  },
];

export default ColumnLayoutExample;
