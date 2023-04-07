import { BaseEditor, Transforms } from "slate";
import { ReactEditor } from "slate-react";

export const highlightElementTemporarily = (
  path: any,
  setHighlightedElements: (arg0: {
    (prevHighlightedElements: any): Set<unknown>;
    (prevHighlightedElements: any): Set<unknown>;
  }) => void
) => {
  // Add the element path to the highlightedElements set
  setHighlightedElements((prevHighlightedElements) => {
    const updatedSet = new Set(prevHighlightedElements);
    updatedSet.add(JSON.stringify(path));
    return updatedSet;
  });
};
