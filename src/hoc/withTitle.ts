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
          case 1:
            type = "paragraph";
            enforceType(type);
          default:
            break;
        }
      }
    }

    // Fall back to the original `normalizeNode`
    normalizeNode(entry);
  };

  // editor.deleteBackward = (unit) => {
  //   const { selection } = editor;

  //   if (
  //     selection &&
  //     Path.equals(selection.anchor.path, [1, 0]) &&
  //     selection.anchor.offset === 0
  //   ) {
  //     const titleNode = Node.get(editor, [0]);
  //     const firstParagraph = Node.get(editor, [1]);

  //     // Move the content from the second node (first paragraph) into the first node (title)
  //     Transforms.moveNodes(editor, {
  //       at: [1, 0],
  //       to: [0, titleNode.children.length],
  //     });

  //     // Remove the empty second node (first paragraph)
  //     Transforms.removeNodes(editor, { at: [1] });

  //     // Set the type of the first node to 'title'
  //     Transforms.setNodes(editor, { type: "title" }, { at: [0] });

  //     // Place the cursor at the end of the title
  //     const titleTextLength = Node.string(titleNode).length;
  //     Transforms.select(editor, { path: [0, 0], offset: titleTextLength });
  //     return;
  //   }

  //   originalDeleteBackward(unit);
  // };

  return editor;
};

// custom delete for inline link elements

export const withCustomDelete = (editor) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const parentBlock = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
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
                    match: (n) => Editor.isBlock(editor, n),
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
