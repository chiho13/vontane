import React from "react";
import {
  ParagraphElement,
  DefaultElement,
  EquationElement,
  ColumnElement,
  ColumnCellElement,
  MCQElement,
  OptionList,
  OptionListItem,
  ListItem,
  TitleElement,
} from "./index";

export function ElementSelector(props) {
  const { element, attributes, children } = props;

  switch (element.type) {
    case "title":
      return <TitleElement {...props} />;
    case "paragraph":
      return <ParagraphElement {...props} />;
    case "list-item":
      return <ListItem {...props} />;
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
    case "option-list-item":
      return <OptionListItem {...props}>{children}</OptionListItem>;
    default:
      return <DefaultElement {...props} />;
  }
}
