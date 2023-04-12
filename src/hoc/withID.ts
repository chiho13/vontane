import { nanoid } from "nanoid";
import { Element } from "slate";

export const genNodeId = () => nanoid(16);

export const assignIdRecursively = (node) => {
  if (Element.isElement(node)) {
    node.id = genNodeId();
    node.children.forEach(assignIdRecursively);
  }
};

export const addRandomIds = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(addRandomIds);
  } else if (typeof obj === "object") {
    const newObj = { ...obj };
    if (newObj.type) {
      newObj.id = genNodeId();
    }
    Object.keys(newObj).forEach((key) => {
      newObj[key] = addRandomIds(newObj[key]);
    });
    return newObj;
  } else {
    return obj;
  }
};

export const withID = (editor) => {
  const { apply } = editor;

  editor.apply = (operation) => {
    if (operation.type === "insert_node") {
      assignIdRecursively(operation.node);
      return apply(operation);
    }

    if (operation.type === "split_node") {
      operation.properties.id = genNodeId();
      return apply(operation);
    }

    return apply(operation);
  };

  return editor;
};
