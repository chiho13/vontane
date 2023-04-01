import { React } from "react";
import {
  ParagraphElement,
  DefaultElement,
  EquationElement,
  ColummnElement,
  ColumnCellElement,
} from "./index";

import { SortableElement } from "../SortableElement";

export function ElementSelector(props) {
  const { element } = props;

  switch (element.type) {
    case "paragraph":
      return <ParagraphElement {...props} />;
    case "equation":
      return <EquationElement {...props} />;
    case "column":
      return <ColummnElement {...props} />;
    case "column-cell":
      return <ColumnCellElement {...props} />;

    default:
      return <DefaultElement {...props} />;
  }
}
