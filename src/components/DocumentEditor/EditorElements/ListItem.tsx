import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Node, Transforms } from "slate";
import styled from "styled-components";
import { hasSlideElement } from "@/utils/helpers";
import { RxDotFilled } from "react-icons/rx";
import { MdCircle } from "react-icons/md";
import { Checkbox } from "@/components/ui/checkbox";
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
`;

const findAllNumberedLists = (nodes) => {
  let numberedLists = [];
  let currentListIndex = 0;

  nodes.forEach((node) => {
    if (node.type !== "numbered-list") {
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
  const { attributes, children, element, listType, listNumber } = props;
  const path = ReactEditor.findPath(editor, element);
  const [isVisible, setIsVisible] = useState(false);
  const focused = useFocused();
  const selected = useSelected();
  const listItemRef = useRef(null);

  const [isChecked, setChecked] = useState(element.checked || false);

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

  let placeholderText = "";
  if (element.children[0].text === "") {
    placeholderText = selected
      ? "Press '/' for commands"
      : isCheckedList
      ? "To-do"
      : "List";
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

  return (
    <ListItemStyle>
      <li
        ref={listItemRef}
        className={` ${
          selectedElementID === element.id ? " bg-[#E0EDFB]" : "bg-transparent"
        }
         ml-[21px] list-none transition
      duration-200 ease-in-out
        ${isCheckedList && isChecked && "text-muted-foreground line-through"}
        `}
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        data-placeholder={placeholderText}
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

        {isCheckedList && (
          <Checkbox
            checked={isChecked}
            onCheckedChange={handleCheck}
            className="absolute  -translate-x-[24px] translate-y-[4px]"
          />
        )}
        {isBulletList && (
          <MdCircle className="absolute w-[8px] -translate-x-[24px] translate-y-[4px]" />
        )}
        {children}
      </li>
    </ListItemStyle>
  );
});
