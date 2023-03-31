import { React } from "react";

export function ParagraphElement(props) {
  const { attributes, children, element } = props;

  return (
    <p {...attributes} data-id={element.id}>
      {children}
    </p>
  );
}
