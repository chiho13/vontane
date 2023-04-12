import React from "react";
import {
  ParagraphElement,
  DefaultElement,
  EquationElement,
  ColumnElement,
  ColumnCellElement,
  MCQElement,
  OptionList,
  ListItem,
} from "./index";

export function ElementSelector(props) {
  const { element, attributes, children } = props;

  switch (element.type) {
    case "paragraph":
      return <ParagraphElement {...props} />;
    case "equation":
      return <EquationElement {...props} />;
    case "column":
      return <ColumnElement {...props} />;
    case "column-cell":
      return <ColumnCellElement {...props} />;
    case "mcq":
      return <MCQElement {...props} />;
    case "ol":
      return <OptionList {...props} />;
    case "list-item":
      return <ListItem {...props}>{children}</ListItem>;
    default:
      return <DefaultElement {...props} />;
  }
}
