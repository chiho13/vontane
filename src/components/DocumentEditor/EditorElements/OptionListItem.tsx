import React, { useContext, useState, useEffect } from "react";
import { Editor, Transforms, createEditor, Path } from "slate";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";
import { Check } from "lucide-react";
import styled from "styled-components";

const StyledOptionListItem = styled.li`
  position: relative;
  padding: 8px;
  width: auto;
  display: list-item;
`;

// Custom List Item component
export const OptionListItem = ({ attributes, children, element }) => {
  const { editor } = useContext(EditorContext);
  const [checked, setChecked] = useState(element.correctAnswer || false);

  useEffect(() => {
    // Update the local checked state whenever element.correctAnswer changes
    setChecked(element.correctAnswer || false);
  }, [element.correctAnswer]);

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
    <StyledOptionListItem
      {...attributes}
      className={`rounded border-2 ${
        checked ? "border-blue-500" : "border-gray-200"
      }`}
    >
      <span>{children}</span>
      <input
        type="checkbox"
        id={element.id}
        className="absolute -top-[2px] right-2 ml-2 h-[36px] w-[36px] cursor-pointer opacity-0"
        checked={checked}
        onChange={handleChange}
      />
      {checked ? (
        <div className="absolute right-2  top-0 flex h-full  items-center items-center ">
          <div className="h-[24px] w-[24px] border-2 border-blue-500">
            <Check className="absolute right-0 h-[24px] w-[24px] text-blue-500" />
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute  right-2 top-0 flex h-full items-center">
          <div className="h-[24px] w-[24px] border-2 border-gray-300">
            <Check className="hidden h-[24px] w-[24px] text-blue-500" />
          </div>
        </div>
      )}
    </StyledOptionListItem>
  );
};
