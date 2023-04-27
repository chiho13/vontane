// SlideBreak.js
import { EditorContext } from "@/contexts/EditorContext";
import React, { useContext } from "react";
import { ReactEditor } from "slate-react";

export const SlideBreak = ({ attributes, children, element }) => {
  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  return (
    <div
      {...attributes}
      style={{ border: "1px solid #ccc", margin: "1rem 0", padding: "0.5rem" }}
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
    >
      <hr />
      {children}
    </div>
  );
};
