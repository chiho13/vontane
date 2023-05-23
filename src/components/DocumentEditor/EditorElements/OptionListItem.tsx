import React, { useContext, useState, useEffect } from "react";
import { Editor, Transforms, createEditor, Path } from "slate";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused } from "slate-react";
import { Check } from "lucide-react";
import styled from "styled-components";
import { Checkbox } from "@/components/ui/checkbox";

const StyledOptionListItem = styled.li`
  position: relative;
  padding: 8px;
  width: auto;
  display: list-item;

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
export const OptionListItem = React.memo(
  ({ attributes, children, element }) => {
    const { editor } = useContext(EditorContext);
    const [checked, setChecked] = useState(element.correctAnswer || false);
    const focused = useFocused();

    // const path = ReactEditor.findPath(editor, element);
    // console.log(path);
    const isEmpty =
      element.children.length === 1 && element.children[0].text === "";

    const shouldShowPlaceholder = isEmpty;

    useEffect(() => {
      // Update the local checked state whenever element.correctAnswer changes
      setChecked(element.correctAnswer || false);
    }, [element.correctAnswer]);

    const handleChange = () => {
      const path = ReactEditor.findPath(editor, element);

      if (checked) {
        return;
      }
      if (checked) {
        // If the option is currently checked, uncheck all options
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
      } else {
        // If the option is currently unchecked, check it and uncheck all other options
        const parentPath = Path.parent(path);
        const [parentNode] = Editor.node(editor, parentPath);

        parentNode.children.forEach((child, index) => {
          const isCorrectAnswer = Path.equals(path, [...parentPath, index]);

          Transforms.setNodes(
            editor,
            { correctAnswer: isCorrectAnswer },
            { at: [...parentPath, index] }
          );
        });
      }
    };

    return (
      <StyledOptionListItem
        {...attributes}
        className={` rounded border-2 bg-white dark:border-gray-500 dark:bg-muted ${
          checked ? "border-blue-500 dark:border-brand" : "border-gray-400"
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
        <div className=" absolute top-0 right-2 flex h-full items-center">
          <Checkbox
            className="h-[24px] w-[24px] border-gray-400 dark:border-gray-500"
            checked={checked}
            onCheckedChange={handleChange}
          />
        </div>
      </StyledOptionListItem>
    );
  }
);
