// src/helpers/mcqHelper.js
import { Element as SlateElement, Editor, Path, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { genNodeId } from "@/hoc/withID";

export const addMapBlock = (editor, path) => {
  const id = genNodeId();
  const imageNode = {
    id,
    type: "map",
    align: "center",
    width: "100%",
    height: 250,
    latLng: [50.879, 4.6997],
    children: [{ text: "" }],
  };

  const [currentNode] = Editor.node(editor, path);
  const isEmptyNode =
    SlateElement.isElement(currentNode) &&
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
