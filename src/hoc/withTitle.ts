// withTitle.js
import { Transforms, Node, Path } from "slate";

export const withTitle = (editor) => {
  const { normalizeNode } = editor;
  const originalDeleteBackward = editor.deleteBackward;

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

  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (
      selection &&
      Path.equals(selection.anchor.path, [1, 0]) &&
      selection.anchor.offset === 0
    ) {
      const titleNode = Node.get(editor, [0]);
      const firstParagraph = Node.get(editor, [1]);

      // Move the content from the second node (first paragraph) into the first node (title)
      Transforms.moveNodes(editor, {
        at: [1, 0],
        to: [0, titleNode.children.length],
      });

      // Remove the empty second node (first paragraph)
      Transforms.removeNodes(editor, { at: [1] });

      // Set the type of the first node to 'title'
      Transforms.setNodes(editor, { type: "title" }, { at: [0] });

      // Place the cursor at the end of the title
      const titleTextLength = Node.string(titleNode).length;
      Transforms.select(editor, { path: [0, 0], offset: titleTextLength });
      return;
    }

    originalDeleteBackward(unit);
    // Fall back to the original `deleteBackward`
  };

  return editor;
};
