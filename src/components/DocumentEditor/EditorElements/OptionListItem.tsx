import React, { useContext, useState, useEffect } from "react";
import {
  Element as SlateElement,
  Editor,
  Transforms,
  createEditor,
  Path,
  Node,
} from "slate";
import { EditorContext, SlateEditorContext } from "@/contexts/EditorContext";
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
  padding-left: 30px;
  width: auto;

  span[data-placeholder]::after {
    content: attr(data-placeholder);
    pointer-events: none;
    opacity: 0.333;
    user-select: none;
    position: absolute;
    top: 8px;
    left: 30px;
  }
`;

export const findAllNumberedLists = (nodes) => {
  let numberedLists: any[] = [];
  let currentListIndex = 0;

  nodes.forEach((node) => {
    if (node.type !== "option-list-item") {
      currentListIndex++; // Increment list index when a non-numbered-list node is encountered
    } else {
      numberedLists.push({
        ...node,
        listIndex: currentListIndex,
      });
    }
  });

  return numberedLists;
};

const withListNumbering = (Component) => {
  return (props) => {
    const { element } = props;

    const { editor } = useContext(SlateEditorContext);

    if (!editor) {
      return <Component {...props} questionNumber={null} />;
    }

    // Find all numbered-list elements within the editor
    const numberedLists = findAllNumberedLists(editor.children);

    // Assign number to each numbered list based on its position in the array
    const listNumber = numberedLists.reduce((num, list, index) => {
      if (list.id === element.id) {
        return numberedLists
          .slice(0, index + 1)
          .filter((el) => el.listIndex === list.listIndex).length;
      }
      return num;
    }, 0);

    const alpha = String.fromCharCode(64 + listNumber);
    return <Component {...props} listNumber={alpha} />;
  };
};

// Custom List Item component
export const OptionListItem = withListNumbering(
  ({ attributes, children, element, listNumber }) => {
    const { editor } = useContext(SlateEditorContext);
    const [checked, setChecked] = useState(element.correctAnswer || false);
    const focused = useFocused();

    const path = ReactEditor.findPath(editor, element);
    // console.log(path);
    const isEmpty =
      element.children.length === 1 && element.children[0].text === "";

    const shouldShowPlaceholder = isEmpty;

    const handleChange = (checked) => {
      setChecked(checked);
      const path = ReactEditor.findPath(editor, element);
      ReactEditor.focus(editor);
      Transforms.select(editor, Editor.end(editor, path));

      // Toggle the correctAnswer state based on the checkbox state
      Transforms.setNodes(editor, { correctAnswer: checked }, { at: path });
    };

    return (
      <StyledOptionListItem
        {...attributes}
        className={` relative  list-none rounded border-2 bg-white  dark:bg-muted ${
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
          <span
            contentEditable={false}
            className="absolute mr-[5px] -translate-x-[20px] "
          >
            {listNumber}.{" "}
          </span>
          {children}
        </span>
        <div className=" absolute right-2 top-0 flex h-full items-center">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <Checkbox
                  className="h-[24px] w-[24px] translate-y-[2px] border-gray-400 dark:border-gray-500"
                  checked={checked}
                  onCheckedChange={handleChange}
                />
              </TooltipTrigger>

              {!checked && (
                <TooltipContent
                  className="border-black  dark:bg-white dark:text-muted"
                  side="top"
                  sideOffset={10}
                >
                  <p className="text-[12px]">Set as Correct Answer</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </StyledOptionListItem>
    );
  }
);
