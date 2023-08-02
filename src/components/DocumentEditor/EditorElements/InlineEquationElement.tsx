import { EditorContext } from "@/contexts/EditorContext";
import React, { useContext, useState } from "react";
import { ReactEditor, useSelected } from "slate-react";
import { InlineMath } from "react-katex";

import { css } from "@emotion/css";
import { Transforms } from "slate";
import { TbMathFunction } from "react-icons/tb";

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

export const InlineEquation = (props: {
  attributes: any;
  children: any;
  element: any;
}) => {
  const { attributes, children, element } = props;
  const selected = useSelected();
  const { editor, showEditBlockPopup, selectedElementID, activePath } =
    useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  return (
    <div
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className={`inline-equation-element inline cursor-pointer px-1 py-1  dark:text-blue-400 ${
        selected && "ring-1 ring-gray-300"
      }
      ${
        showEditBlockPopup.path === JSON.stringify(path) &&
        element.latex?.trim() !== ""
          ? " bg-[#E0EDFB] dark:bg-background"
          : "bg-transparent"
      }
      `}
      onClick={() => {
        Transforms.select(editor, path);
      }}
    >
      <InlineMath math={element.latex || ""} />

      {element.latex?.trim() === "" && (
        <span className="bg-gray-300 p-1 text-gray-800 opacity-60">
          {" "}
          New Equation{" "}
        </span>
      )}
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </div>
  );
};
