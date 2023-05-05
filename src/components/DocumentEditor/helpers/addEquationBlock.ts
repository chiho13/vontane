import { genNodeId } from "@/hoc/withID";
import { Editor, Path, Transforms } from "slate";

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
    currentNode.type === "paragraph" &&
    currentNode.children.length === 1 &&
    currentNode.children[0].text === "";

  let newPath: Path;

  if (isEmptyNode) {
    Transforms.insertNodes(editor, equationNode, { at: path });
    newPath = path;
    // Transforms.insertNodes(
    //   editor,
    //   { id: genNodeId(), type: "paragraph", children: [{ text: "" }] },
    //   { at: Path.next(path) }
    // );
  } else {
    Transforms.insertNodes(editor, equationNode, { at: Path.next(path) });
    newPath = Path.next(path);
  }

  return newPath;
};
