import { RenderLeafProps } from "slate-react";

export const Leaf: React.FC<RenderLeafProps> = ({
  attributes,
  children,
  leaf,
}) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <del>{children}</del>;
  }

  if (leaf.highlighted) {
    children = (
      <span {...attributes} className="bg-blue-200 py-[3px] dark:bg-[#365476]">
        {children}
      </span>
    );
  }

  if (leaf.blank) {
    return (
      <span
        {...attributes}
        contentEditable={false}
        className="relative top-[5px] ml-1 mr-1 inline-block h-5 w-24 border-b-2 border-gray-600 px-1 py-0.5 dark:border-foreground"
      >
        {children}
      </span>
    );
  }

  return <span {...attributes}>{children}</span>;
};
