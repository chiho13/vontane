import { Editor, Element, Operation } from "slate";
import { nanoid } from "nanoid";

export const makeNodeId = (): string => nanoid(16);

export const assignIdRecursively = (node: Element): void => {
  if (Element.isElement(node)) {
    node.id = makeNodeId();
    node.children.forEach(assignIdRecursively);
  }
};

export const withNodeId = (editor: Editor): Editor => {
  const { apply } = editor;

  editor.apply = (operation: Operation) => {
    if (operation.type === "insert_node") {
      assignIdRecursively(operation.node as Element);
      return apply(operation);
    }

    if (operation.type === "split_node") {
      operation.properties.id = makeNodeId();
      return apply(operation);
    }

    return apply(operation);
  };

  return editor;
};
