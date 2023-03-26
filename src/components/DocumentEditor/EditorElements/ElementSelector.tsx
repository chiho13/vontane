import { React } from "react";
import { ParagraphElement, DefaultElement, EquationElement } from "./index";

export function ElementSelector(props) {
  const { element } = props;

  switch (element.type) {
    case "paragraph":
      return <ParagraphElement {...props} />;
    case "equation":
      return <EquationElement {...props} />;
    default:
      return <DefaultElement {...props} />;
  }
}
