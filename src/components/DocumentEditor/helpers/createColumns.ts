import { Element as SlateElement, Transforms, Editor, Path, Node } from "slate";
import { EditorContext } from "@/contexts/EditorContext";
import { genNodeId } from "@/hoc/withID";

export const findPathById = (editor, id): Path | null => {
  let foundPath: any = null;

  for (const [node, path] of Node.nodes(editor)) {
    if (SlateElement.isElement(node) && node.id === id) {
      foundPath = path;
      break;
    }
  }

  return foundPath;
};
export const createColumns = (fromPath, over, editor, insertDirection) => {
  if (Path.equals(fromPath, over.path)) {
    return; // Do nothing if they are the same
  }
  // Remove the dragged node
  const [draggedNode] = Editor.node(editor, fromPath);
  const overPath = over.path;

  const [droppedNode] = Editor.node(editor, overPath);

  // Determine the order of children in the new column based on insertDirection
  const children =
    insertDirection === "left"
      ? [
          { id: genNodeId(), type: "column-cell", children: [draggedNode] },
          { id: genNodeId(), type: "column-cell", children: [droppedNode] },
        ]
      : [
          { id: genNodeId(), type: "column-cell", children: [droppedNode] },
          { id: genNodeId(), type: "column-cell", children: [draggedNode] },
        ];

  // Create a new column with the dragged node and the target node
  const newColumn = {
    id: genNodeId(),
    type: "column",
    children: children,
  };

  // Find the target node's path
  const toPath = findPathById(editor, over.id) as Path;

  // Insert the new column before or after the target node
  Transforms.insertNodes(editor, newColumn, {
    at: Path.next(toPath),
    select: true,
  });

  Transforms.removeNodes(editor, { at: overPath });
  Transforms.removeNodes(editor, { at: fromPath });
};
