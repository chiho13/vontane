export function DefaultElement(props: {
  attributes: any;
  children: any;
  element: any;
}) {
  const { attributes, children, element } = props;

  return <p {...attributes}>{children}</p>;
}

DefaultElement.displayName = "DefaultElement";
