import { useContext } from "react";
import { EquationContext } from "@/contexts/EquationEditContext";
import { ReactEditor } from "slate-react";

export function ColumnCellElement(props) {
  const { attributes, children, element } = props;

  const { editor } = useContext(EquationContext);
  const path = ReactEditor.findPath(editor, element);
  return (
    <div
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className="flex-1 rounded pb-2 pt-2"
    >
      {children}
    </div>
  );
}
