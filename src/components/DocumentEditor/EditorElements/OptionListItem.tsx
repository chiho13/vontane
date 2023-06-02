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

const findAllNumberedLists = (nodes, inMcq = false, listIndex = 0) => {
  let numberedLists = [];

  nodes.forEach((node) => {
    if (node.type === "mcq") {
      // We've found a 'mcq' node. Let's get all 'option-list-item' children
      numberedLists = [
        ...numberedLists,
        ...findAllNumberedLists(node.children, true, listIndex),
      ];
      listIndex++; // Increment the list index for each 'mcq' node we encounter
    } else if (node.type === "option-list-item" && inMcq) {
      // This 'option-list-item' is inside an 'mcq' node and 'ol'. Add it to the list.
      numberedLists.push({ ...node, listIndex });
    } else if (node.children) {
      // This node is not an 'mcq' or 'option-list-item' or 'ol', but it has children. Recurse down.
      numberedLists = [
        ...numberedLists,
        ...findAllNumberedLists(node.children, false, listIndex),
      ];
    }
  });

  return numberedLists;
};

const withListNumbering = (Component) => {
  return (props) => {
    const { element } = props;
    const { editor } = useContext(EditorContext);

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
