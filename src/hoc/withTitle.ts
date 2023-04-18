// withTitle.js
import { Transforms } from "slate";

export const withTitle = (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Ensure the first node is of type 'title'
    if (path.length === 0 && node.children[0].type !== "title") {
      const titleNode = { type: "title", children: [{ text: "" }] };
      Transforms.insertNodes(editor, titleNode, { at: [0] });

      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    }

    // Fall back to the original `normalizeNode`
    normalizeNode(entry);
  };

  return editor;
};
