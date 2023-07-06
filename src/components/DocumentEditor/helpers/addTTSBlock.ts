// src/helpers/mcqHelper.js
import { Element as SlateElement, Editor, Path, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { genNodeId } from "@/hoc/withID";

export const addTTSBlock = (editor: Editor, path: Path) => {
  const id = genNodeId();
  const ttsNode = {
    id,
    type: "tts",
    voice_id: "022dAxTS7hgOwOZorFb9",
    name: "Arthur",
    accent: "british",
    audioplayer: false,
    children: [
      {
        id: genNodeId(),
        type: "paragraph",
        children: [{ text: "" }],
      },
    ],
  };

  const [currentNode] = Editor.node(editor, path);
  const isEmptyNode =
    SlateElement.isElement(currentNode) &&
    currentNode.type === "paragraph" &&
    currentNode.children.length === 1 &&
    currentNode.children[0].text === "";

  let newPath;
  if (isEmptyNode) {
    Transforms.insertNodes(editor, ttsNode, { at: path });

    newPath = path;
  } else {
    Transforms.insertNodes(editor, ttsNode, { at: Path.next(path) });
    newPath = Path.next(path);
  }

  return { newPath, id };
};
