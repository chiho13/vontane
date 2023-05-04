// src/helpers/mcqHelper.js
import { Editor, Path, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { genNodeId } from "@/hoc/withID";

export const addSlideBreak = (editor, path) => {
  const slideBreakNode = {
    id: genNodeId(),
    type: "slide",
    children: [{ text: "" }],
  };

  const [currentNode] = Editor.node(editor, path);
  const isEmptyNode =
    currentNode.type === "paragraph" &&
    currentNode.children.length === 1 &&
    currentNode.children[0].text === "";

  let newPath;
  if (isEmptyNode) {
    Transforms.insertNodes(editor, slideBreakNode, { at: path });

    newPath = path;
  } else {
    Transforms.insertNodes(editor, slideBreakNode, { at: Path.next(path) });
    newPath = Path.next(path);
  }
};
