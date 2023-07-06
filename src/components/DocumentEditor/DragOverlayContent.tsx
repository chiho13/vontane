import { useEditor } from "@/hooks/useEditor";
import React from "react";
import { useContext, useState } from "react";
import { Editable, Slate } from "slate-react";
import { LayoutContext } from "../Layouts/AccountLayout";
import { ElementSelector } from "./EditorElements";

export const DragOverlayContent = ({ element }) => {
  const editor = useEditor();
  const [value] = useState([{ ...element }]);

  const { isLocked } = useContext(LayoutContext);

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
