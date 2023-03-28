export const TwoColumnElement = ({ attributes, children, element }) => {
  return (
    <div {...attributes} className="w-1/2">
      {children}
    </div>
  );
};
