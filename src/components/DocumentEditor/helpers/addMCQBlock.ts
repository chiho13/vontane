// src/helpers/mcqHelper.js
import { Element as SlateElement, Editor, Path, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { genNodeId } from "@/hoc/withID";

export const addMCQBlock = (editor, path) => {
  const mcqNode = {
    id: genNodeId(),
    type: "option-list-item",
    children: [
      {
        text: "",
      },
    ],
    correctAnswer: false,
  };

  const [currentNode] = Editor.node(editor, path);
  console.log(currentNode);
  const isEmptyNode =
    SlateElement.isElement(currentNode) &&
    currentNode.type === "paragraph" &&
    currentNode.children.length === 1 &&
    currentNode.children[0].text === "";

  let newPath;
  if (isEmptyNode) {
    Transforms.insertNodes(editor, mcqNode, { at: path });

    newPath = path;
  } else {
    Transforms.insertNodes(editor, mcqNode, { at: Path.next(path) });
    newPath = Path.next(path);
  }

  const listItemPath = newPath.concat([0, 0]);
  const listItemPoint = { path: listItemPath, offset: 0 };
  Transforms.select(editor, listItemPoint);
  ReactEditor.focus(editor);
};
