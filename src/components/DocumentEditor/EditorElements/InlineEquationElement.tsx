import { EditorContext, SlateEditorContext } from "@/contexts/EditorContext";
import React, { useContext, useState } from "react";
import { ReactEditor, useSelected } from "slate-react";
import { InlineMath } from "react-katex";
import katex from "katex";
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
  const { showEditBlockPopup, selectedElementID, activePath } =
    useContext(EditorContext);

  const { editor } = useContext(SlateEditorContext);

  const path = ReactEditor.findPath(editor, element);

  console.log(element.latex);
  return (
    <span
      key={element.id}
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className={`inline-equation-element inline-block cursor-pointer rounded-md px-1 py-1 text-gray-800 hover:bg-gray-100  dark:text-gray-200 dark:hover:bg-[#2c2f33] 
      ${
        showEditBlockPopup.path === JSON.stringify(path) &&
        element.latex?.trim() !== ""
          ? " bg-[#E0EDFB] dark:bg-gray-800"
          : "bg-transparent"
      }
      `}
      onClick={() => {
        Transforms.select(editor, path);
      }}
    >
      <InlineMath math={element.latex} />
      {children}
      {element.latex?.trim() === "" && (
        <span className="bg-gray-300 p-1 text-gray-800 opacity-60">
          {" "}
          Equation{" "}
        </span>
      )}
      <div className="hidden">{children}</div>
    </span>
  );
};
