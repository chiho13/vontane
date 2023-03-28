export function ParagraphElement(props) {
  const { attributes, children, element } = props;

  return <p {...attributes}>{children}</p>;
}
