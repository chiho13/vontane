import React from "react";
import { Editor, Transforms, createEditor, Path } from "slate";
import { useContext } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";

// Custom List Item component
export const OptionListItem = ({ attributes, children, element }) => {
  const { editor } = useContext(EditorContext);

  const handleChange = (e) => {
    const path = ReactEditor.findPath(editor, element);
    const isSelected = e.target.checked;

    if (!isSelected && element.correctAnswer) {
      // Prevent unchecking the currently selected option
      return;
    }

    // Unset correctAnswer for all other siblings if the current option is being set to true
    if (isSelected) {
      const parentPath = Path.parent(path);
      const [parentNode] = Editor.node(editor, parentPath);

      parentNode.children.forEach((child, index) => {
        if (child.correctAnswer) {
          Transforms.setNodes(
            editor,
            { correctAnswer: false },
            { at: [...parentPath, index] }
          );
        }
      });
    }

    // Set correctAnswer for the current option
    Transforms.setNodes(editor, { correctAnswer: isSelected }, { at: path });
  };

  return (
    <li {...attributes} className="ml-10">
      <div className="flex items-center">
        {children}
        <input
          type="checkbox"
          id={element.id}
          className="ml-2 h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          checked={element.correctAnswer || false}
          onChange={handleChange}
        />
      </div>
    </li>
  );
};
