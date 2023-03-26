import { useContext } from "react";
import Image from "next/image";
import { BlockMath } from "react-katex";
import { EquationContext } from "@/contexts/EquationEditContext";
import { ReactEditor } from "slate-react";

export function EquationElement(props) {
  const { attributes, children, element } = props;
  const { editor } = useContext(EquationContext);
  const path = ReactEditor.findPath(editor, element);
  return (
    <div
      tabIndex={0}
      data-path={JSON.stringify(path)}
      data-id={element.id}
      className={`equation-element my-2 flex w-[98%] items-center rounded-md p-2 ${
        element.latex.trim() === "" ? "bg-gray-100" : "justify-center"
      } cursor-pointer transition duration-300 hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-200`}
      //   onClick={(event) =>
      //     openEditBlockPopup(event, ReactEditor.findPath(editor, element))
      //   }
      contentEditable={false}
      //   ref={toggleEditBlockRef}
    >
      <BlockMath math={element.latex || ""} />

      {element.latex.trim() === "" && (
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
