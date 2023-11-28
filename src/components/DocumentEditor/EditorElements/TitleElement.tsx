import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext, SlateEditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path } from "slate";
import styled from "styled-components";
import { useTextSpeech } from "@/contexts/TextSpeechContext";

const TitleStyle = styled.div`
  h1 {
    font-size: 24px;
    font-weight: bold;
    letter-spacing: -0.8px;
  }
  h1[data-placeholder]::after {
    content: attr(data-placeholder);
    pointer-events: none;
    opacity: 0.333;
    user-select: none;
    position: absolute;
    top: 16px;
  }

  padding-left: 48px;
  padding-bottom: 12px;
  padding-top: 16px;
`;

export function TitleElement(props) {
  const { showEditBlockPopup, setSelectedElementID } =
    useContext(EditorContext);
  const { editor } = useContext(SlateEditorContext);
  const { fontStyle } = useTextSpeech();
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
    <TitleStyle className={`${fontStyle} dark:text-gray-200 lg:w-[680px]`}>
      <h1
        ref={paragraphRef}
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        data-element={element.type}
        data-placeholder={shouldShowPlaceholder ? "Untitled Workspace" : ""}
      >
        {children}
      </h1>
    </TitleStyle>
  );
}
