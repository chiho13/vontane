export function DefaultElement(props) {
  const { attributes, children, element } = props;

  return <p {...attributes}>{children}</p>;
}
