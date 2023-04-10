import React from "react";
import { RenderLeafProps } from "slate-react";

export const Blank = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props;

  if (leaf.blank) {
    return (
      <span
        {...attributes}
        contentEditable={false}
        className="relative top-[2px] ml-1 mr-1 inline-block h-5 w-24 border-b-2 border-gray-400 px-1 py-0.5"
      >
        {children}
      </span>
    );
  }

  return <span {...attributes}>{children}</span>;
};
