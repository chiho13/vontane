import { Transforms, Editor, Path, Node } from "slate";
import { EditorContext } from "@/contexts/EditorContext";
import { genNodeId } from "@/hoc/withID";

export const findPathById = (editor, id) => {
  let foundPath = null;

  for (const [node, path] of Node.nodes(editor, { at: [] })) {
    if (node.id === id) {
      foundPath = path;
      break;
    }
  }

  return foundPath;
};

export const createColumns = (fromPath, over, editor) => {
  if (Path.equals(fromPath, over.path)) {
    return; // Do nothing if they are the same
  }
  // Remove the dragged node
  const [draggedNode] = Editor.node(editor, fromPath);
  const overPath = over.path;

  const [droppedNode] = Editor.node(editor, overPath);

  // Create a new column with the dragged node and the target node
  const newColumn = {
    id: genNodeId(),
    type: "column",
    children: [
      { id: genNodeId(), type: "column-cell", children: [droppedNode] },
      { id: genNodeId(), type: "column-cell", children: [draggedNode] },
    ],
  };

  // Find the target node's path
  const toPath = findPathById(editor, over.id);

  // Insert the new column before or after the target node
  Transforms.insertNodes(editor, newColumn, {
    at: Path.next(toPath),
    select: true,
  });

  Transforms.removeNodes(editor, { at: overPath });

  Transforms.removeNodes(editor, { at: fromPath });

  // setTimeout(() => {
  //   const [_, newColumnPath] = Editor.last(editor, []);
  //   const lastCell = [...Editor.nodes(editor, { at: newColumnPath })]
  //     .reverse()
  //     .find(([node]) => node.type === "column-cell");
  //   const lastCellId = lastCell[0].id;
  //   console.log(lastCellId);
  //   const lastColumnCell = findEquationElementById(lastCellId);
  //   console.log(lastColumnCell);
  //   if (lastColumnCell) {
  //     lastColumnCell.style.backgroundColor = "#e3ecf7";
  //   }
  // }, 100);
};
