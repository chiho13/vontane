import { useContext, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { BlockMath } from "react-katex";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";

export function EquationElement(props) {
  const { attributes, children, element } = props;
  const { editor, showEditBlockPopup } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  return (
    <div
      tabIndex={0}
      data-path={JSON.stringify(path)}
      data-id={element.id}
      className={`equation-element my-2 mr-2 flex w-auto items-center rounded-md p-2 hover:bg-gray-100 ${
        element.latex?.trim() === "" ? "bg-gray-100" : "justify-center"
      } 
      ${showEditBlockPopup && "bg-[#E0EDFB] "}
      cursor-pointer`}
      contentEditable={false}
    >
      <BlockMath math={element.latex || ""} />

      {element.latex?.trim() === "" && (
        <div className="flex items-center">
          <Image
            src="/images/tex.png"
            alt="add latex block equation"
            width={50}
            height={50}
            className="opacity-30"
          />
          <span className="ml-4 opacity-30">Add Block Equation</span>
        </div>
      )}

      <span style={{ display: "none" }}>{children}</span>
    </div>
  );
}
