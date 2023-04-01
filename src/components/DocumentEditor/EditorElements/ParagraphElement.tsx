import { React, useContext } from "react";
import { EquationContext } from "@/contexts/EquationEditContext";
import { ReactEditor } from "slate-react";

export function ParagraphElement(props) {
  const { editor } = useContext(EquationContext);
  const { attributes, children, element } = props;
  const path = ReactEditor.findPath(editor, element);

  return (
    <p {...attributes} data-id={element.id} data-path={JSON.stringify(path)}>
      {children}
    </p>
  );
}
