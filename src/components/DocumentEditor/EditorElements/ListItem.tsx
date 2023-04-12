import { useContext, useEffect, useState, useRef } from "react";
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

export function ListItem(props) {
  const { editor } = useContext(EditorContext);
  const { attributes, children, element } = props;
  const path = ReactEditor.findPath(editor, element);

  return (
    <div {...attributes} data-id={element.id} data-path={JSON.stringify(path)}>
      {children}
    </div>
  );
}
