// src/helpers/mcqHelper.js
import { Element as SlateElement, Editor, Path, Transforms } from "slate";
import { genNodeId } from "@/hoc/withID";

export const addEmbedBlock = (editor, path) => {
  const id = genNodeId();
  const imageNode = {
    id,
    url: "",
    type: "embed",
    width: 680,
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

export const addDataVisBlock = (editor, path) => {
  const id = genNodeId();
  const imageNode = {
    id,
    type: "datavis",
    width: 680,
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
