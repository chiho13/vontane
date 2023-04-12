import React, { useContext } from "react";
import { ReactEditor } from "slate-react";
import { EditorContext } from "@/contexts/EditorContext";

interface MCQElementProps {
  attributes: any;
  children: React.ReactNode;
  element: any;
}

export const MCQElement: React.FC<MCQElementProps> = ({
  element,
  attributes,
  children,
}) => {
  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);
  return (
    <div
      {...attributes}
      className="mcq-element rounded-md bg-gray-100 p-4"
      data-id={element.id}
      data-path={JSON.stringify(path)}
    >
      {children}
    </div>
  );
};
