import React, { useContext, useState, useEffect } from "react";
import { Editor, Transforms, createEditor, Path, Node } from "slate";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused } from "slate-react";
import { Check } from "lucide-react";
import styled from "styled-components";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const StyledOptionListItem = styled.li`
  position: relative;
  padding: 8px;
  padding-right: 40px;
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

    const path = ReactEditor.findPath(editor, element);
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
      ReactEditor.focus(editor);
      Transforms.select(editor, Editor.end(editor, path));
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
        className={` rounded border-2 bg-white  dark:bg-muted ${
          checked
            ? "border-blue-500 dark:border-brand"
            : "border-gray-400 dark:border-gray-500"
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
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <Checkbox
                  className="h-[24px] w-[24px] translate-y-[2px] border-gray-400 dark:border-gray-500"
                  checked={checked}
                  onCheckedChange={handleChange}
                />
              </TooltipTrigger>
              <TooltipContent
                className="border-black  dark:bg-white dark:text-muted"
                side="top"
                sideOffset={10}
              >
                <p className="text-[12px]">Set as Correct Answer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </StyledOptionListItem>
    );
  }
);
