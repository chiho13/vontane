import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Transforms } from "slate";
import styled from "styled-components";
const ListItemStyle = styled.div`
  p[data-placeholder]::after {
    content: attr(data-placeholder);
    pointer-events: none;
    opacity: 0.333;
    user-select: none;
    position: absolute;
    top: 40px;
  }
`;

export function QuestionItem(props) {
  const { editor } = useContext(EditorContext);
  const { attributes, children, element } = props;
  const path = ReactEditor.findPath(editor, element);
  const focused = useFocused();
  const selected = useSelected();
  const [isVisible, setIsVisible] = useState(false);

  const isEmpty =
    element.children.length === 1 && element.children[0].text === "";

  const shouldShowPlaceholder = isEmpty;

  return (
    <ListItemStyle>
      <div
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
      >
        <p
          className="text-[18px]"
          data-placeholder={shouldShowPlaceholder ? "Enter question" : ""}
        >
          {children}
        </p>
      </div>
    </ListItemStyle>
  );
}
