import { useContext, useEffect, useState, useRef } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";

export const ElevenTTSWrapper = (props) => {
  const { attributes, children, element } = props;
  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  return (
    <div
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className="rounded-lg border border-gray-400"
    >
      {children}
    </div>
  );
};
