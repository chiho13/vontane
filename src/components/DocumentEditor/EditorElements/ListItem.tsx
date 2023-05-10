import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Node } from "slate";
import styled from "styled-components";
import { hasSlideElement } from "@/utils/helpers";

const ListItemStyle = styled.div`
  li[data-placeholder]::after {
    content: attr(data-placeholder);
    pointer-events: none;
    opacity: 0.333;
    user-select: none;
    position: absolute;
    top: 0;
  }

  li {
    margin-left: 20px;
  }
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
  const focused = useFocused();
  const selected = useSelected();
  const listItemRef = useRef(null);

  useEffect(() => {
    if (editor && path) {
      const isFirstElement = Path.equals(path, [0]);
      const hasSingleElement = editor.children.length === 1;
      const isEmpty =
        element.children.length === 1 && element.children[0].text === "";

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
    (isVisible && (!focused || (focused && editor.children.length === 1))) ||
    (focused && selected && element.children[0].text === "");

  return (
    <ListItemStyle>
      <li
        ref={listItemRef}
        className={`${selectedElementID === element.id ? " bg-[#E0EDFB]" : ""}
        `}
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        data-placeholder={shouldShowPlaceholder ? "Press '/' for commands" : ""}
      >
        {children}
      </li>
    </ListItemStyle>
  );
}
