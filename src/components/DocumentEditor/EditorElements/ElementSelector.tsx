import {
  ParagraphElement,
  DefaultElement,
  EquationElement,
  TwoColumnElement,
  ColumnElement, // Import the ColumnElement component
} from "./index";

export function ElementSelector(props) {
  const { element } = props;

  switch (element.type) {
    case "paragraph":
      return <ParagraphElement {...props} />;
    case "equation":
      return <EquationElement {...props} />;
    case "twoColumn": // Add the case for the twoColumn type
      return <TwoColumnElement {...props} />;
    case "column": // Add the case for the column type
      return <ColumnElement {...props} />;
    default:
      return <DefaultElement {...props} />;
  }
}
