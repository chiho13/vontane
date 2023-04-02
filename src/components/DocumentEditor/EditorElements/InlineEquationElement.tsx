import { useContext } from "react";
import Image from "next/image";
import { InlineMath } from "react-katex";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";

export const InlineMathLeaf = ({ attributes, children, leaf }) => {
  if (leaf.isInlineMath) {
    return (
      <span {...attributes} contentEditable={false}>
        <span className="inline-flex items-center">
          <InlineMath math={leaf.math} />
          {/* {leaf.math?.trim() === "" && (
            <div className="flex items-center">
              <Image
                src="/images/inline.png"
                alt="add latex block equation"
                width={50}
                height={50}
                className="opacity-30"
              />
              <span className="ml-4 opacity-30">Add Inline Equation</span>
            </div>
          )} */}
        </span>
        {children}
      </span>
    );
  }
  return <span {...attributes}>{children}</span>;
};
