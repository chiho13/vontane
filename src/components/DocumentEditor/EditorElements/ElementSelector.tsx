import {
  ParagraphElement,
  DefaultElement,
  EquationElement,
  TwoColumnElement,
  ColumnContainer, // Import the ColumnElement component
} from "./index";

export function ElementSelector(props) {
  const { element } = props;

  switch (element.type) {
    case "paragraph":
      return <ParagraphElement {...props} />;
    case "equation":
      return <EquationElement {...props} />;
    case "column-container":
      return <ColumnContainer {...props} />;
    case "column":
      return <TwoColumnElement {...props} />;
    default:
      return <DefaultElement {...props} />;
  }
}
