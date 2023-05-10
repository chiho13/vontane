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
  }

  margin-left: 20px;
`;

export function ListItem(props) {
  const {
    editor,
    showEditBlockPopup,
    selectedElementID,
    setSelectedElementID,
  } = useContext(EditorContext);
  const { attributes, children, element } = props;
  const path = ReactEditor.findPath(editor, element);
  const [isVisible, setIsVisible] = useState(false);
  const parent = Editor.parent(editor, path);
  const focused = useFocused();
  const selected = useSelected();
  const listItemRef = useRef(null);

  const [bgClass, setBGClass] = useState(true);

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

  const hasSlide = hasSlideElement(editor.children);

  useEffect(() => {
    if (!focused && !selected) {
      setSelectedElementID("");
    }
  }, [focused, selected]);

  const shouldShowPlaceholder =
    focused && selected && element.children[0].text === "";

  const isNumberedList = parent[0].type === "numbered-list";
  const bulletList = parent[0].type === "bulleted-list";
  const itemNumber = isNumberedList ? path[path.length - 1] + 1 : null; // Calculate the item number based on the path

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
        `}
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        data-placeholder={placeholderText}
      >
        {/* {isNumberedList && <span contentEditable={false}>{itemNumber}. </span>} */}
        {children}
      </li>
    </ListItemStyle>
  );
}
