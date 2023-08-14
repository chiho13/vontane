import { useContext, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { BlockMath } from "react-katex";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useSelected } from "slate-react";
import { Editor } from "slate";
import { OptionMenu } from "../OptionMenu";
import { cn } from "@/utils/cn";

export function EquationElement(props) {
  const { attributes, children, element } = props;
  const { editor, showEditBlockPopup, selectedElementID, activePath } =
    useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  const selected = useSelected();

  console.log("selected", selectedElementID, path);
  return (
    <div
      tabIndex={0}
      data-path={JSON.stringify(path)}
      data-id={element.id}
      className={cn(`equation-element relative mr-4 flex items-center justify-center   rounded-md p-2 py-1 text-gray-800 transition  hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#2c2f33]
      ${
        showEditBlockPopup.path === JSON.stringify(path) ||
        element.latex?.trim() === ""
          ? " bg-[#E0EDFB] dark:bg-gray-800"
          : " bg-transparent"
      }

      ${element.latex?.trim() === "" && "justify-start py-2"}
      cursor-pointer`)}
      contentEditable={false}
    >
      <div className="dark:text-gray-300">
        <BlockMath math={element.latex || ""} />
      </div>

      {element.latex?.trim() === "" && (
        <div className="flex items-center">
          <Image
            src="/images/tex.png"
            alt="add latex block equation"
            width={50}
            height={50}
            className="rounded-md opacity-30 dark:bg-white"
          />
          <span className="ml-4 opacity-30">Add Block Equation</span>
        </div>
      )}

      {children}
    </div>
  );
}
