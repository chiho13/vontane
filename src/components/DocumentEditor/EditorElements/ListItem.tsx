import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Node, Transforms } from "slate";
import styled from "styled-components";
import { hasSlideElement } from "@/utils/helpers";
import { RxDotFilled } from "react-icons/rx";
import { MdCircle } from "react-icons/md";
import { Checkbox } from "@/components/ui/checkbox";
import { alignMap } from "../helpers/toggleBlock";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ListItemStyle = styled.div`
  position: relative;
  li[data-placeholder]::after {
    content: attr(data-placeholder);
    pointer-events: none;
    opacity: 0.333;
    user-select: none;
    position: absolute;
    top: 0;
    left: 21px;
  }

  li[data-list-type="options"][data-placeholder]::after {
    left: 51px;
  }
`;

export const findAllNumberedLists = (nodes) => {
  let numberedLists: any[] = [];
  let currentListIndex = 0;

  nodes.forEach((node) => {
    if (node.type !== "numbered-list" && node.type !== "option-list-item") {
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

    return <Component {...props} listNumber={listNumber} />;
  };
};

export const ListItem = withListNumbering((props) => {
  const {
    editor,
    showEditBlockPopup,
    selectedElementID,
    setSelectedElementID,
  } = useContext(EditorContext);
  const { children, element, listType, listNumber, isPreview = false } = props;
  const path = ReactEditor.findPath(editor, element);
  const [isVisible, setIsVisible] = useState(false);
  const focused = useFocused();
  const selected = useSelected();
  const listItemRef = useRef(null);

  const [isChecked, setChecked] = useState(element.checked || false);

  const [isCheckedCorrect, setCheckedCorrect] = useState(
    element.correctAnswer || false
  );
  useEffect(() => {
    if (editor && path) {
      const isFirstElement = Path.equals(path, [0]);
      const hasSingleElement = editor.children.length === 1;
      const isEmpty =
        element.children.length === 1 && element.children[0].text === "";

      setIsVisible(isFirstElement && hasSingleElement && isEmpty);
    }
  }, [editor, path, children, focused]);

  useEffect(() => {
    if (!focused && !selected) {
      setSelectedElementID("");
    }
  }, [focused, selected]);

  const isNumberedList = listType === "numbered";
  const isCheckedList = listType === "checkbox";
  const isBulletList = listType === "bullet";
  const isOptionList = listType === "options";

  let placeholderText = "";
  if (element.children[0].text === "") {
    placeholderText = selected
      ? "Press '/' for commands"
      : isCheckedList
      ? "To-do"
      : "List";

    if (isOptionList) {
      placeholderText = element.correctAnswer
        ? "Edit Correct Answer"
        : "Enter Option";
    }
  }

  const handleCheck = (checked) => {
    setChecked(checked);

    ReactEditor.focus(editor);
    Transforms.select(editor, Editor.end(editor, path));
    Transforms.setNodes(
      editor,
      { checked }, // New properties
      { at: path } // Location
    );
  };

  const handleOptionCheck = (checked) => {
    setCheckedCorrect(checked);
    ReactEditor.focus(editor);
    Transforms.select(editor, Editor.end(editor, path));

    // Toggle the correctAnswer state based on the checkbox state
    Transforms.setNodes(editor, { correctAnswer: checked }, { at: path });
  };

  const listItemClass = useMemo(
    () =>
      `${selectedElementID === element.id ? " bg-[#E0EDFB]" : "bg-transparent"}
    list-none transition
    duration-200 ease-in-out
    text-${alignMap[element.align] || element.align}
    ${isCheckedList && isChecked && "text-muted-foreground line-through"}
    ${isOptionList ? " ml-[51px]" : " ml-[21px]"}
    `,
    [
      selectedElementID,
      element.id,
      alignMap,
      element.align,
      isCheckedList,
      isChecked,
    ]
  );

  return (
    <ListItemStyle>
      <li
        ref={listItemRef}
        className={listItemClass}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        data-placeholder={!isPreview ? placeholderText : ""}
        data-list-type={listType}
        data-listNumber={listNumber}
      >
        {isNumberedList && (
          <span
            contentEditable={false}
            className="absolute mr-[5px] -translate-x-[21px] "
          >
            {listNumber}.{" "}
          </span>
        )}

        {isOptionList && (
          <span
            contentEditable={false}
            className="absolute mr-[5px] -translate-x-[21px] "
          >
            {String.fromCharCode(64 + listNumber)}.{" "}
          </span>
        )}

        {isCheckedList && (
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleCheck}
            className="absolute  -translate-x-[24px] translate-y-[4px]"
          />
        )}

        {isOptionList && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger className="absolute  -translate-x-[51px]">
                <Checkbox
                  checked={isCheckedCorrect}
                  onCheckedChange={handleOptionCheck}
                />
              </TooltipTrigger>

              {!isCheckedCorrect && (
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
        )}
        {isBulletList && (
          <MdCircle className="absolute w-[8px] -translate-x-[24px] translate-y-[4px]" />
        )}
        {children}
      </li>
    </ListItemStyle>
  );
});
