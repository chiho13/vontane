import { useContext } from "react";
import { EditorContext, SlateEditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";

export function ColumnElement(props: any) {
  const { attributes, children, element } = props;

  const { editor } = useContext(SlateEditorContext);
  const path = ReactEditor.findPath(editor, element);
  return (
    <div
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className="grid w-full grid-cols-2 items-start"
    >
      {children}
    </div>
  );
}

ColumnElement.displayName = "ColumnElement";
