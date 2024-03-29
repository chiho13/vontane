import { useContext } from "react";
import { EditorContext, SlateEditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";

export function ColumnCellElement(props: {
  attributes: any;
  children: any;
  element: any;
}) {
  const { attributes, children, element } = props;

  const { editor } = useContext(SlateEditorContext);
  const path = ReactEditor.findPath(editor, element);

  return (
    <div
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className="flex-1 rounded pb-1 pt-1"
    >
      {children}
    </div>
  );
}

ColumnCellElement.displayName = "ColumnCellElement";
