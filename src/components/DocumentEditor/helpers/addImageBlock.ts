// src/helpers/mcqHelper.js
import { Editor, Path, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { genNodeId } from "@/hoc/withID";

export const addImageBlock = (editor, path) => {
  const id = genNodeId();
  const imageNode = {
    id,
    url: "",
    type: "image",
    width: "100%",
    children: [{ text: "" }],
  };

  const [currentNode] = Editor.node(editor, path);
  const isEmptyNode =
    currentNode.type === "paragraph" &&
    currentNode.children.length === 1 &&
    currentNode.children[0].text === "";

  let newPath;
  if (isEmptyNode) {
    Transforms.insertNodes(editor, imageNode, { at: path });

    newPath = path;
  } else {
    Transforms.insertNodes(editor, imageNode, { at: Path.next(path) });
    newPath = Path.next(path);
  }

  return { newPath, id };
};
