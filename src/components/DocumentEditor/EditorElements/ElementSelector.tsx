import { React } from "react";
import { ParagraphElement, DefaultElement, EquationElement } from "./index";

export function ElementSelector(props) {
  const { element, attributes, children } = props;

  switch (element.type) {
    case "twoColumn":
      return (
        <div
          {...attributes}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridColumnGap: "16px",
          }}
        >
          {children}
        </div>
      );
    case "paragraph":
      return <ParagraphElement {...props} />;
    case "equation":
      return <EquationElement {...props} />;
    default:
      return <DefaultElement {...props} />;
  }
}
