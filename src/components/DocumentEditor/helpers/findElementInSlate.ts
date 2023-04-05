function findElementById(node, id) {
  if (node.id === id) {
    return node;
  }

  if (node.children) {
    for (const child of node.children) {
      const found = findElementById(child, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

export function findElementInSlateValue(slateValue, id) {
  for (const node of slateValue) {
    const found = findElementById(node, id);
    if (found) {
      return found;
    }
  }

  return null;
}
