import { EditorContext } from "@/contexts/EditorContext";
import React, { useContext, useState } from "react";
import { ReactEditor, useSelected } from "slate-react";

import { css } from "@emotion/css";

const InlineChromiumBugfix = () => (
  <span
    contentEditable={false}
    className={css`
      font-size: 0;
    `}
  >
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

export const LinkElement = (props) => {
  const { attributes, children, element } = props;
  const selected = useSelected();
  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  return (
    <a
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className={`inline text-brand underline dark:text-blue-400 ${
        selected && "ring-1 ring-gray-300"
      }`}
      href={props.element.url}
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );
};
