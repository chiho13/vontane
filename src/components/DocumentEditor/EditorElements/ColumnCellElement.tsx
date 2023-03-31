import { React } from "react";

export function ColumnCellElement(props) {
  const { attributes, children, element } = props;

  return (
    <div {...attributes} className="flex-1 rounded pb-2 pt-2">
      {children}
    </div>
  );
}
