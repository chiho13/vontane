// withTitle.js
import {
  Transforms,
  Node,
  Range,
  Path,
  Editor,
  Point,
  Element,
  Text,
} from "slate";

export const withNormalise = (editor) => {
  const { normalizeNode, insertText } = editor;
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
      const paragraphNode = {
        type: "paragraph",
        align: "start",
        children: [{ text: "" }],
      };
      Transforms.setNodes(editor, paragraphNode, { at: path });
      return;
    }

    if (path.length === 0) {
      if (editor.children.length <= 1 && Editor.string(editor, [0, 0]) === "") {
        const title = {
          type: "title",
          children: [{ text: "" }],
        };
        Transforms.insertNodes(editor, title, {
          at: path.concat(0),
          select: true,
        });
      }

      if (editor.children.length < 2) {
        const paragraph = {
          type: "paragraph",
          align: "start",
          children: [{ text: "" }],
        };
        Transforms.insertNodes(editor, paragraph, { at: path.concat(1) });
      }

      for (const [child, childPath] of Node.children(editor, path)) {
        let type: string;
        const slateIndex = childPath[0];
        const enforceType = (type) => {
          if (Element.isElement(child) && child.type !== type) {
            const newProperties: Partial<Element> = { type };
            Transforms.setNodes<Element>(editor, newProperties, {
              at: childPath,
            });
          }
        };

        switch (slateIndex) {
          case 0:
            type = "title";
            enforceType(type);
            break;

          default:
            break;
        }
      }
    }

    // Fall back to the original `normalizeNode`
    normalizeNode(entry);
  };

  // Override the default insertText behavior
  editor.insertText = (text) => {
    const { selection } = editor;

    // Handle Range Selection Across Multiple Nodes
    if (selection && !Range.isCollapsed(selection)) {
      Transforms.delete(editor);
      return;
    }

    if (
      selection &&
      Range.isCollapsed(selection) &&
      Editor.above(editor, {
        match: (n) => Element.isElement(n) && n.type === "inline-equation",
        at: selection,
        mode: "highest",
      }) &&
      Editor.isEnd(editor, selection.anchor, selection.anchor.path)
    ) {
      // Move the selection to just after the inline-equation
      const point = Editor.after(editor, selection.anchor);

      if (point) {
        Transforms.setSelection(editor, { anchor: point, focus: point });
      }

      // Insert the new text
      return insertText(editor, text);
    }

    // Fall back to the original insertText
    return insertText(text);
  };

  return editor;
};

// custom delete for inline link elements

export const withCustomDelete = (editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const parentBlock = Editor.above(editor, {
        match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
      });

      if (parentBlock) {
        const [, parentPath] = parentBlock;
        const startAtParent = Editor.start(editor, parentPath);

        if (Point.equals(selection.anchor, startAtParent)) {
          const prevBlock = Editor.before(editor, parentPath);

          if (prevBlock) {
            const [prevNode] = Editor.node(editor, prevBlock);
            if (Element.isElement(prevNode) && prevNode.children.length > 0) {
              const lastChild = prevNode.children[prevNode.children.length - 1];

              if (lastChild.type === "link") {
                const endOfPrevNode = Editor.end(editor, prevBlock);
                const pointBeforeLink = Editor.before(editor, endOfPrevNode);
                if (pointBeforeLink) {
                  Transforms.splitNodes(editor, {
                    at: selection,
                    match: (n) =>
                      Element.isElement(n) && Editor.isBlock(editor, n),
                  });
                  const text = Node.string(parentBlock[0]);
                  Transforms.insertText(editor, text, { at: endOfPrevNode });
                  Transforms.removeNodes(editor, { at: parentPath });
                }
                return;
              }
            }
          }
        }
      }
    }

    deleteBackward(unit);
  };

  return editor;
};
