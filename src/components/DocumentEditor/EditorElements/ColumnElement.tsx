import { React } from "react";

export function ColummnElement(props) {
  const { attributes, children, element } = props;

  return (
    <div
      {...attributes}
      className="grid w-full grid-cols-2 items-start gap-4 pb-2 pt-2"
    >
      {children}
    </div>
  );
}
