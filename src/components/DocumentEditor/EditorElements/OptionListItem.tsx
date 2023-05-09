import React, { useContext, useState, useEffect } from "react";
import { Editor, Transforms, createEditor, Path } from "slate";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused } from "slate-react";
import { Check } from "lucide-react";
import styled from "styled-components";

const StyledOptionListItem = styled.li`
  position: relative;
  padding: 8px;
  width: auto;
  display: list-item;
  background: #ffffff;

  span[data-placeholder]::after {
    content: attr(data-placeholder);
    pointer-events: none;
    opacity: 0.333;
    user-select: none;
    position: absolute;
    top: 8px;
    left: 28px;
  }
`;

// Custom List Item component
export const OptionListItem = ({ attributes, children, element }) => {
  const { editor } = useContext(EditorContext);
  const [checked, setChecked] = useState(element.correctAnswer || false);
  const focused = useFocused();

  const isEmpty =
    element.children.length === 1 && element.children[0].text === "";

  const shouldShowPlaceholder = isEmpty;

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
      className={`linear-gradient-right rounded border-2 ${
        checked ? "border-blue-500" : "border-gray-200"
      }`}
    >
      <span
        data-placeholder={
          shouldShowPlaceholder
            ? element.correctAnswer
              ? "Edit correct answer"
              : "Enter Option"
            : ""
        }
      >
        {children}
      </span>
      <div className="absolute -top-[2px] right-2 flex h-full items-center">
        <input
          type="checkbox"
          id={element.id}
          className="h-[24px] w-[24px] cursor-pointer opacity-0"
          checked={checked}
          onChange={handleChange}
        />
      </div>
      {checked ? (
        <div className="pointer-events-none absolute right-2  top-0 flex h-full  items-center items-center ">
          <div className="h-[24px] w-[24px] border-2 border-blue-500">
            <Check className="absolute right-0 h-[24px] w-[24px] -translate-y-[1px] text-blue-500" />
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
