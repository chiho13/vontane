// withTitle.js
import { Transforms, Node, Path } from "slate";

export const withTitle = (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Ensure the first node is of type 'title'
    if (Path.equals(path, [0]) && node.type !== "title") {
      const titleNode = { type: "title", children: [{ text: "" }] };
      Transforms.setNodes(editor, titleNode, { at: path });
      return;
    }

    // Ensure other nodes are not of type 'title'
    if (!Path.equals(path, [0]) && node.type === "title") {
      const paragraphNode = { type: "paragraph", children: [{ text: "" }] };
      Transforms.setNodes(editor, paragraphNode, { at: path });
      return;
    }

    // Fall back to the original `normalizeNode`
    normalizeNode(entry);
  };

  return editor;
};
