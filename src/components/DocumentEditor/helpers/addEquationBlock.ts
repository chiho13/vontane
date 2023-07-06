import { genNodeId } from "@/hoc/withID";
import { Element as SlateElement, Editor, Path, Transforms } from "slate";

export const addEditableEquationBlock = (latex: string, editor, path: Path) => {
  const equationId = genNodeId();

  const equationNode = {
    id: equationId,
    type: "equation",
    altText: "",
    latex,
    children: [{ text: " " }],
  };

  const [currentNode] = Editor.node(editor, path);
  const isEmptyNode =
    SlateElement.isElement(currentNode) &&
    currentNode.type === "paragraph" &&
    currentNode.children.length === 1 &&
    currentNode.children[0].text === "";

  let newPath: Path;

  if (isEmptyNode) {
    Transforms.insertNodes(editor, equationNode, { at: path });
    newPath = path;
  } else {
    Transforms.insertNodes(editor, equationNode, { at: Path.next(path) });
    newPath = Path.next(path);
  }

  return { newPath, id: equationId };
};
