import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Node } from "slate";
import styled from "styled-components";
import { hasSlideElement } from "@/utils/helpers";

const HeadingElementStyle = styled.div`
  &[data-type="h1"],
  &[data-type="h2"],
  &[data-type="h3"] {
    &[data-placeholder]::after {
      content: attr(data-placeholder);
      pointer-events: none;
      opacity: 0.333;
      user-select: none;
      position: absolute;
      top: 0;
    }
  }
`;

export function HeadingElement(props) {
  const {
    editor,
    showEditBlockPopup,
    selectedElementID,
    setSelectedElementID,
  } = useContext(EditorContext);
  const { attributes, children, element, tag } = props;

  const HeadingTag = tag || "h1";
  const path = ReactEditor.findPath(editor, element);
  const [isVisible, setIsVisible] = useState(false);
  const focused = useFocused();
  const selected = useSelected();
  const paragraphRef = useRef(null);
  const headingSizeMap = {
    "heading-one": "text-4xl",
    "heading-two": "text-3xl",
    "heading-three": "text-2xl",
  };
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
    <HeadingElementStyle>
      <HeadingTag
        ref={paragraphRef}
        className={`${
          headingSizeMap[element.type as keyof typeof headingSizeMap] ||
          "text-xl"
        } ${selectedElementID === element.id ? " bg-[#E0EDFB]" : ""}
        `}
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        data-placeholder={shouldShowPlaceholder ? "Press '/' for commands" : ""}
      >
        {children}
      </HeadingTag>
    </HeadingElementStyle>
  );
}
