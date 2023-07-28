import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Node, Transforms, Range } from "slate";
import styled from "styled-components";
import { hasSlideElement } from "@/utils/helpers";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { isParentMCQ } from "../helpers/toggleBlock";

interface ParagraphElementProps {
  isParentMCQ: boolean;
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
  }
`;

export function ParagraphElement(props) {
  const {
    editor,
    showEditBlockPopup,
    selectedElementID,
    setSelectedElementID,
  } = useContext(EditorContext);
  const { attributes, children, element, type } = props;
  const path = ReactEditor.findPath(editor, element);
  const [isVisible, setIsVisible] = useState(false);
  const focused = useFocused();
  const selected = useSelected();
  const paragraphRef = useRef(null);

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
      element.children[0].text === "" &&
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

  useEffect(() => {
    if (selected) {
      setElementData(element);
    }
  }, [selected, element]);

  return (
    <ParagraphStyle isParentMCQ={isParentMCQ(editor)} type={type}>
      <p
        ref={paragraphRef}
        className={`paragraph-element  

        ${
          selected && showRightSidebar
            ? "  bg-[#E0EDFB] dark:bg-[#3169a5]/80"
            : ""
        }

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
}
