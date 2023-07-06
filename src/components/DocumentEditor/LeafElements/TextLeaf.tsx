import { RenderLeafProps } from "slate-react";

import { BaseText } from "slate";

interface MyText extends BaseText {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  highlighted?: boolean;
  blank?: boolean;
}

export const Leaf: React.FC<RenderLeafProps> = ({
  attributes,
  children,
  leaf,
}) => {
  const customLeaf = leaf as MyText;

  if (customLeaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (customLeaf.italic) {
    children = <em>{children}</em>;
  }

  if (customLeaf.underline) {
    children = <u>{children}</u>;
  }

  if (customLeaf.strikethrough) {
    children = <del>{children}</del>;
  }

  if (customLeaf.highlighted) {
    children = (
      <span {...attributes} className="bg-blue-200 py-[3px] dark:bg-[#365476]">
        {children}
      </span>
    );
  }

  if (customLeaf.blank) {
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
