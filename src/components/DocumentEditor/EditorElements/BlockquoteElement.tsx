import { EditorContext } from "@/contexts/EditorContext";
import React, { useContext, useState } from "react";
import { ReactEditor, useSelected } from "slate-react";

import { ParagraphElement } from "./ParagraphElement";

export const BlockQuoteElement = (props: {
  attributes: any;
  children: any;
  element: any;
}) => {
  const { attributes, children, element } = props;
  const selected = useSelected();
  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  return (
    <blockquote
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className={` items-center border-l-4 border-gray-400 bg-white pl-3  text-gray-500 dark:bg-muted dark:text-gray-300 `}
    >
      <div className="relative py-2">
        <ParagraphElement {...props} type={element.type} />
      </div>
    </blockquote>
  );
};
