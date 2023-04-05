import { useContext, useEffect, useState } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Transforms } from "slate";
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
    if (editor) {
      const elementNode = Editor.node(editor, path);
      if (
        elementNode[0].children.length === 1 &&
        elementNode[0].children[0].text === ""
      ) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }
  }, [editor, path, children]);
  return (
    <ParagraphStyle>
      <p
        className="paragraph-element"
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        data-placeholder={
          isVisible && focused && selected ? "Press '/' for commands" : ""
        }
      >
        {children}
      </p>
    </ParagraphStyle>
  );
}
