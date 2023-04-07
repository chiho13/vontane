import { BaseEditor, Transforms } from "slate";
import { ReactEditor } from "slate-react";

export const highlightElementTemporarily = (
  element: any,
  editor: BaseEditor & ReactEditor,
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

  // Remove the element path from the highlightedElements set after a specified duration
  //   setTimeout(() => {
  //     setHighlightedElements((prevHighlightedElements) => {
  //       const updatedSet = new Set(prevHighlightedElements);
  //       updatedSet.delete(JSON.stringify(path));
  //       return updatedSet;
  //     });

  //     const updatedElement = { ...element, newlyAdded: false };
  //     Transforms.setNodes(editor, updatedElement, { at: path });
  //   }, 3000); // Change the duration (in milliseconds) to your desired value
};

export const updateNewlyAddedOnPathChange = (
  element: any,
  editor: BaseEditor & ReactEditor,
  path: any
) => {
  const updatedElement = { ...element, newlyAdded: false };
  Transforms.setNodes(editor, updatedElement, { at: path });
};
