import {
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Text } from "slate";
import styled from "styled-components";

import { alignMap } from "@/components/DocumentEditor/helpers/toggleBlock";

import { AudioManagerContext } from "@/contexts/PreviewAudioContext";
import { cn } from "@/utils/cn";

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
  let groupCounter = 0;

  nodes.forEach((node, index) => {
    if (node.type !== "numbered-list" && node.type !== "option-list-item") {
      currentListIndex++;
      if (
        index > 0 &&
        (nodes[index - 1].type === "numbered-list" ||
          nodes[index - 1].type === "option-list-item")
      ) {
        groupCounter++;
      }
    } else {
      numberedLists.push({
        ...node,
        listIndex: currentListIndex,
        groupIndex: groupCounter,
      });
    }
  });

  return numberedLists;
};

const withListNumbering = (Component) => {
  return (props) => {
    const { element, nodes } = props;

    if (!nodes) {
      return <Component {...props} questionNumber={null} />;
    }

    // Find all numbered-list elements within the editor
    const numberedLists = findAllNumberedLists(nodes);

    // Assign number to each numbered list based on its position in the array
    const listNumber = numberedLists.reduce((num, list, index) => {
      if (list.id === element.id) {
        return numberedLists
          .slice(0, index + 1)
          .filter((el) => el.listIndex === list.listIndex).length;
      }
      return num;
    }, 0);

    // Get the group number of current list item
    const currentListItem = numberedLists.find(
      (list) => list.id === element.id
    );
    const groupNumber = currentListItem ? currentListItem.groupIndex : null;

    return (
      <Component {...props} listNumber={listNumber} groupNumber={groupNumber} />
    );
  };
};

export const ListItem = withListNumbering((props) => {
  const {
    editor,
    showEditBlockPopup,
    selectedElementID,
    setSelectedElementID,
  } = useContext(EditorContext);
  const {
    nodes,
    children,
    element,
    listType,
    listNumber,
    groupNumber,
    isPreview = false,
  } = props;

  const { selectedOption, setSelectedOption } = useContext(AudioManagerContext);

  const selected = useSelected();
  const listItemRef = useRef(null);

  const [isChecked, setChecked] = useState(element.checked || false);

  const isEmpty = element.children.every((child) => {
    // Checks if the child is a text node and if it's empty
    return Text.isText(child) && child.text === "";
  });

  const isNumberedList = listType === "numbered";
  const isCheckedList = listType === "checkbox";
  const isOptionList = listType === "options";

  let placeholderText = "";

  if (isEmpty) {
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

  const handleOptionPreviewChange = useCallback(
    (e) => {
      setSelectedOption((prevOptions) => ({
        ...prevOptions,
        [groupNumber]: e.target.value,
      }));
    },
    [groupNumber]
  );
  const listItemClass = useMemo(
    () =>
      `${selectedElementID === element.id ? " bg-[#E0EDFB]" : "bg-transparent"}
      list-none transition
      duration-200 ease-in-out
      text-${alignMap[element.align] || element.align}
      ${isCheckedList && isChecked && "text-muted-foreground line-through"}
      ${isOptionList && !isPreview ? " ml-[51px]" : " ml-[21px]"}
  
      ${isOptionList && isPreview && "flex items-center ml-[40px]"}
     
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
    <ListItemStyle
      className={`text-gray-800 dark:text-gray-300 ${
        isOptionList && isPreview ? " rounded-md p-2" : ""
      }
        `}
    >
      <li
        ref={listItemRef}
        className={listItemClass}
        data-id={element.id}
        data-list-type={listType}
      >
        {isNumberedList && (
          <span
            contentEditable={false}
            className="absolute mr-[5px] -translate-x-[21px] "
          >
            {listNumber}.{" "}
          </span>
        )}

        {isOptionList && isPreview && (
          <span
            contentEditable={false}
            className={cn(`absolute mr-3  mr-[5px] flex h-[28px] w-[28px] -translate-x-[41px] items-center justify-center rounded-md  border border-gray-400 dark:border-gray-700
              ${
                selectedOption[groupNumber] === element.id &&
                "border-brand dark:border-gray-300"
              }
              `)}
          >
            {String.fromCharCode(64 + listNumber)}
          </span>
        )}

        {isOptionList && isPreview && (
          <label
            htmlFor={element.id}
            tabIndex={-1}
            className={cn(`absolute left-0 top-0 flex h-full w-full cursor-pointer items-center justify-end rounded-md border border-gray-400   hover:bg-gray-400/10   dark:border-gray-700 dark:hover:bg-gray-700/20
              ${
                selectedOption[groupNumber] === element.id
                  ? "border-brand dark:border-gray-300 "
                  : ""
              }`)}
          >
            <input
              type="radio"
              id={element.id}
              value={element.id}
              name={`quiz-${groupNumber}`}
              onChange={handleOptionPreviewChange}
              // disabled={answerChecked}
              className="right-0 ml-1 mr-2 hidden h-6 w-6 "
            />
            <div
              className={cn(
                `absolute right-2 flex h-[24px] w-[24px] items-center justify-center rounded-full border border-gray-400  dark:border-gray-700   ${
                  selectedOption[groupNumber] === element.id &&
                  "border-brand dark:border-gray-300"
                }`
              )}
            >
              {selectedOption[groupNumber] === element.id && (
                <div className="h-[16px] w-[16px] rounded-full bg-brand dark:bg-gray-300"></div>
              )}
            </div>
          </label>
        )}
        {children}
      </li>
    </ListItemStyle>
  );
});
