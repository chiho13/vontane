import { useContext, useEffect, useState, useRef, memo, useMemo } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Node, Transforms, Range, Text } from "slate";
import styled from "styled-components";
import { hasSlideElement } from "@/utils/helpers";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { alignMap, isParentMCQ } from "../helpers/toggleBlock";

interface ParagraphElementProps {
  isParentMCQ: boolean;
  type: string;
}

interface ParagraphProp {
  attributes: any; // replace any with the actual type
  children: React.ReactNode;
  element: any; // replace any with the actual type
  type: string;
}

const ParagraphStyle = styled.div<ParagraphElementProps>`
  p[data-placeholder]::after {
    content: attr(data-placeholder);
    pointer-events: none;
    opacity: 0.333;
    user-select: none;
    position: absolute;
    top: ${(props) => (props.isParentMCQ ? "16px" : 0)};
    margin-top: ${(props) => (props.type === "block-quote" ? "8px" : 0)};
    left: 0;
  }
`;

export const ParagraphElement = memo((prop: ParagraphProp) => {
  const editorContext = useContext(EditorContext);
  const {
    editor,
    showEditBlockPopup,
    selectedElementID,
    setSelectedElementID,
  } = useMemo(() => editorContext, [editorContext]);

  const { attributes, children, element, type } = prop;

  const path = ReactEditor.findPath(editor, element);
  const [isVisible, setIsVisible] = useState(false);
  const focused = useFocused();
  const selected = useSelected();
  const paragraphRef = useRef(null);

  const { fontStyle } = useTextSpeech();

  const { setElementData, showRightSidebar } = useTextSpeech();

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

  let shouldShowPlaceholder =
    (isVisible && (!focused || (focused && editor.children.length === 1))) ||
    (focused &&
      selected &&
      element.children.every((child) => {
        return Text.isText(child) && child.text === "";
      }) &&
      editor.selection &&
      Range.isCollapsed(editor.selection));

  let placeholder = "Press '/' for commands";
  const isFirstNode = path[path.length - 1] === 0;

  // Check if the node is empty
  const isEmpty =
    element.children.length === 1 && element.children[0].text === "";

  if (isParentMCQ(editor)) {
    shouldShowPlaceholder = isFirstNode && isEmpty;
  }

  return (
    <ParagraphStyle isParentMCQ={isParentMCQ(editor)} type={type}>
      <p
        ref={paragraphRef}
        className={`paragraph-element  text-${
          alignMap[element.align] || element.align
        }
        dark:text-gray-200
        ${fontStyle}
        ${fontStyle === "font-mono" ? "text-sm" : ""}
        `}
        {...attributes}
        {...(type !== "block-quote" && {
          "data-id": element.id,
          "data-path": JSON.stringify(path),
        })}
        data-placeholder={shouldShowPlaceholder ? placeholder : ""}
      >
        {children}
      </p>
    </ParagraphStyle>
  );
});
