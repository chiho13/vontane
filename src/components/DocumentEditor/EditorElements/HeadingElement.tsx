import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Node, Range } from "slate";
import styled from "styled-components";
import { hasSlideElement } from "@/utils/helpers";
import { alignMap, isParentMCQ } from "../helpers/toggleBlock";

interface HeadingElementProps {
  isParentMCQ: boolean;
}

const HeadingElementStyle = styled.div<HeadingElementProps>`
  & h1,
  & h2,
  & h3 {
    &[data-placeholder]::after {
      content: attr(data-placeholder);
      pointer-events: none;
      opacity: 0.333;
      user-select: none;
      position: absolute;
      top: ${(props) => (props.isParentMCQ ? "16px" : 0)};
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
    "heading-three": "text-xl",
  };
  const placeHolderMap = {
    "heading-one": "Heading 1",
    "heading-two": "Heading 2",
    "heading-three": "Heading 3",
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

  const shouldShowPlaceholder = element.children[0].text === "";

  return (
    <HeadingElementStyle data-type={tag} isParentMCQ={isParentMCQ(editor)}>
      <HeadingTag
        ref={paragraphRef}
        className={`${
          headingSizeMap[element.type as keyof typeof headingSizeMap] ||
          "text-xl"
        } 
        text-${alignMap[element.align] || element.align}
        font-bold
        ${selectedElementID === element.id ? " bg-[#E0EDFB]" : ""}
        `}
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        data-placeholder={
          shouldShowPlaceholder
            ? placeHolderMap[element.type as keyof typeof placeHolderMap]
            : ""
        }
      >
        {children}
      </HeadingTag>
    </HeadingElementStyle>
  );
}
