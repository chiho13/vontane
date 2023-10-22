import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext, SlateEditorContext } from "@/contexts/EditorContext";
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
    top: 16px;
  }
`;

export function QuestionItem(props) {
  const { editor } = useContext(SlateEditorContext);
  const { attributes, children, element } = props;
  const path = ReactEditor.findPath(editor, element);
  const focused = useFocused();
  const selected = useSelected();
  const [isVisible, setIsVisible] = useState(false);

  // Determine if this node is the first child of its parent
  const isFirstNode = path[path.length - 1] === 0;

  // Check if the node is empty
  const isEmpty =
    element.children.length === 1 && element.children[0].text === "";

  // Show placeholder only when the node is the first child and it's empty
  const shouldShowPlaceholder = isFirstNode && isEmpty;

  return (
    <ListItemStyle>
      <div
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
      >
        <p
          className="text-[18px]"
          data-placeholder={
            shouldShowPlaceholder
              ? "Enter question - Press '/' for commands"
              : ""
          }
        >
          {children}
        </p>
      </div>
    </ListItemStyle>
  );
}
