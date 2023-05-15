import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Node, Transforms } from "slate";
import styled from "styled-components";
import { hasSlideElement } from "@/utils/helpers";
import { RxDotFilled } from "react-icons/rx";

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

  // margin-left: 20px;
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

  useEffect(() => {
    if (editor && path) {
      const isFirstElement = Path.equals(path, [0]);
      const hasSingleElement = editor.children.length === 1;
      const isEmpty =
        element.children.length === 1 && element.children[0].text === "";

      console.log(isEmpty);

      setIsVisible(isFirstElement && hasSingleElement && isEmpty);
    }
  }, [editor, path, children, focused]);

  useEffect(() => {
    if (!focused && !selected) {
      setSelectedElementID("");
    }
  }, [focused, selected]);

  const isNumberedList = listType === "numbered";

  let placeholderText = "";
  if (element.children[0].text === "") {
    placeholderText = selected ? "Press '/' for commands" : "List";
  }

  return (
    <ListItemStyle>
      <li
        ref={listItemRef}
        className={` ${
          selectedElementID === element.id ? " bg-[#E0EDFB]" : "bg-transparent"
        }
        transition duration-1000 ease-in-out
        ${isNumberedList && "ml-1 list-none"}
        `}
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        data-placeholder={placeholderText}
      >
        {isNumberedList && (
          <span contentEditable={false} className="mr-[2px]">
            {listNumber}.{" "}
          </span>
        )}
        {children}
      </li>
    </ListItemStyle>
  );
});
