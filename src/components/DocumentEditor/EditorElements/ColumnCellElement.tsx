import { React } from "react";

export function ColumnCellElement(props) {
  const { attributes, children, element } = props;

  return (
    <div {...attributes} className="flex-1 rounded border p-2">
      {children}
    </div>
  );
}
