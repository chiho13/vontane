import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path } from "slate";
import styled from "styled-components";

const TitleStyle = styled.div`
  h1 {
    font-size: 32px;
    font-weight: bold;
    letter-spacing: -0.8px;
  }
  h1[data-placeholder]::after {
    content: attr(data-placeholder);
    pointer-events: none;
    opacity: 0.333;
    user-select: none;
    position: absolute;
    top: 0;
  }

  text-indent: 68px;
  margin-bottom: 36px;
`;

export function TitleElement(props) {
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
      const hasSingleElement = editor.children.length === 1;
      const isEmpty =
        element.children.length === 1 && element.children[0].text === "";

      setIsVisible(hasSingleElement && isEmpty);
    }
  }, [editor, path, children, focused]);
  const shouldShowPlaceholder =
    element.children.length === 1 && element.children[0].text === "";

  return (
    <TitleStyle>
      <h1
        ref={paragraphRef}
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        data-placeholder={shouldShowPlaceholder ? "Untitled" : ""}
      >
        {children}
      </h1>
    </TitleStyle>
  );
}