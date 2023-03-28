export function DefaultElement(props) {
  const { attributes, children, element } = props;

  return <div {...attributes}>{children}</div>;
}
