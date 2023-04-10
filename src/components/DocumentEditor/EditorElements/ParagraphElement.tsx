import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path } from "slate";
import styled from "styled-components";

const ParagraphStyle = styled.div`
  p[data-placeholder]::after {
    content: attr(data-placeholder);
    pointer-events: none;
    opacity: 0.333;
    user-select: none;
    position: absolute;
    top: 0;
  }
`;

export function ParagraphElement(props) {
  const { editor, showEditBlockPopup, elementID, setSelectedElementID } =
    useContext(EditorContext);
  const { attributes, children, element } = props;
  const path = ReactEditor.findPath(editor, element);
  const [isVisible, setIsVisible] = useState(false);
  const focused = useFocused();
  const selected = useSelected();
  const paragraphRef = useRef(null);

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

  const shouldShowPlaceholder =
    (isVisible && (!focused || (focused && editor.children.length === 1))) ||
    (focused && selected && element.children[0].text === "");

  return (
    <ParagraphStyle>
      <p
        ref={paragraphRef}
        className={`paragraph-element ${
          elementID === element.id ? " bg-[#E0EDFB]" : ""
        }`}
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        data-placeholder={shouldShowPlaceholder ? "Press '/' for commands" : ""}
      >
        {children}
      </p>
    </ParagraphStyle>
  );
}
