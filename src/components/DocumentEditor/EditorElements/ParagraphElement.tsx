import { useContext, useEffect, useState } from "react";
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
  const { editor } = useContext(EditorContext);
  const { attributes, children, element } = props;
  const path = ReactEditor.findPath(editor, element);
  const [isVisible, setIsVisible] = useState(false);
  const focused = useFocused();
  const selected = useSelected();

  useEffect(() => {
    if (editor && path) {
      const isFirstElement = Path.equals(path, [0]);
      const hasSingleElement = editor.children.length === 1;
      const isEmpty =
        element.children.length === 1 && element.children[0].text === "";

      setIsVisible(isFirstElement && hasSingleElement && isEmpty);
    }
  }, [editor, path, children, focused]);

  const shouldShowPlaceholder =
    (isVisible && (!focused || (focused && editor.children.length === 1))) ||
    (focused &&
      selected &&
      !Path.equals(path, [0]) &&
      element.children[0].text === "");

  return (
    <ParagraphStyle>
      <p
        className="paragraph-element"
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
