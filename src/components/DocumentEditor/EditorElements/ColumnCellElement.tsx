import { useContext } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";

export function ColumnCellElement(props: {
  attributes: any;
  children: any;
  element: any;
}) {
  const { attributes, children, element } = props;

  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  const style = {
    flexBasis: "20%", // You can set this to any valid CSS value
  };
  return (
    <div
      {...attributes}
      style={style}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className="flex-1 rounded pb-1 pt-1"
    >
      {children}
    </div>
  );
}

ColumnCellElement.displayName = "ColumnCellElement";
