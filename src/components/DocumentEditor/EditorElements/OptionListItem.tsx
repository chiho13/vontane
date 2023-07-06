import React, { useContext, useState, useEffect } from "react";
import {
  Element as SlateElement,
  Editor,
  Transforms,
  createEditor,
  Path,
  Node,
} from "slate";
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

const findAllNumberedLists = (nodes) => {
  let numberedLists = [];
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

const findParentMcq = (nodes, itemId) => {
  let parentMcq = null;

  // Define a recursive function to traverse the tree structure
  const traverse = (nodes) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (
        node.type === "mcq" &&
        node.children.some((child) => child.id === itemId)
      ) {
        // This is the parent MCQ we are looking for
        parentMcq = node;
        break;
      } else if (node.children) {
        // Recurse down the tree
        traverse(node.children);
      }
    }
  };

  // Start the traversal
  traverse(nodes);

  return parentMcq;
};

const withListNumbering = (Component) => {
  return (props) => {
    const { element } = props;
    const { editor } = useContext(EditorContext);

    if (!editor) {
      return <Component {...props} />;
    }

    // First, find the parent MCQ of the current option-list-item element
    const parentMcq = findParentMcq(editor.children, element.id);

    if (!parentMcq) {
      return <Component {...props} />;
    }

    // Then, find all option-list-item elements within the parent MCQ
    const optionListItems = findAllNumberedLists(parentMcq.children);

    // Assign number to each option based on its position in the array
    const listNumber = optionListItems.reduce((num, list, index) => {
      if (list.id === element.id) {
        return optionListItems
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

        SlateElement.isElement(parentNode) &&
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

        SlateElement.isElement(parentNode) &&
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
