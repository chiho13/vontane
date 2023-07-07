import { useEditor } from "@/hooks/useEditor";
import React from "react";
import { useContext, useState } from "react";
import { Editable, ReactEditor, Slate } from "slate-react";
import { LayoutContext } from "../Layouts/AccountLayout";
import { ElementSelector } from "./EditorElements";

interface CustomEditor extends ReactEditor {
  undo: () => void;
  redo: () => void;
}

export const DragOverlayContent = ({ element }: any) => {
  const editor = useEditor() as CustomEditor;
  const [value] = useState([{ ...element }]);

  return (
    <Slate editor={editor} value={value}>
      <div
        style={{
          paddingLeft: 70,
          opacity: 0.6,
        }}
      >
        <Editable
          readOnly
          renderElement={(props) => <ElementSelector {...props} />}
        />
      </div>
    </Slate>
  );
};
