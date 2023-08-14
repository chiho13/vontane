import { EditorContext } from "@/contexts/EditorContext";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import React, { useContext, useState } from "react";
import { ReactEditor, useSelected } from "slate-react";
import { alignMap } from "../helpers/toggleBlock";

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
  const { fontStyle } = useTextSpeech();

  return (
    <blockquote
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className={` items-center border-l-4 border-gray-400 bg-white pl-3 pr-1  text-gray-500 dark:bg-muted dark:text-gray-300

      ${fontStyle}
      ${fontStyle === "font-mono" ? "text-sm" : ""}
      text-${alignMap[element.align] || element.align}
      `}
    >
      {children}
    </blockquote>
  );
};
