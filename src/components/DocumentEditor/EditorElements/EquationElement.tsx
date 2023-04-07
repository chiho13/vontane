import { useContext, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { BlockMath } from "react-katex";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";
import { Transforms } from "slate";
import { highlightElementTemporarily } from "../helpers/highlightElementTemp";
import { motion } from "framer-motion";

export function EquationElement(props) {
  const { attributes, children, element } = props;
  const { editor, showEditBlockPopup } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);
  const [highlightedElements, setHighlightedElements] = useState(new Set());

  useEffect(() => {
    if (element.newlyAdded) {
      highlightElementTemporarily(path, setHighlightedElements);
    }
  }, []);

  useEffect(() => {
    if (!showEditBlockPopup) {
      const updatedElement = { ...element, newlyAdded: false };
      Transforms.setNodes(editor, updatedElement, { at: path });
    }
  }, [showEditBlockPopup]);

  const isHighlighted =
    (highlightedElements.has(JSON.stringify(path)) || showEditBlockPopup) &&
    element.latex?.trim() === "";
  console.log(isHighlighted);

  const bgColor = isHighlighted ? "bg-blue-100" : "bg-transparent";

  const fadeInOutVariants = useMemo(
    () => ({
      initial: { backgroundColor: "rgba(255, 255, 255, 0)" },
      highlighted: { backgroundColor: "rgba(187, 225, 250, 0.5)" },
      notHighlighted: { backgroundColor: "rgba(255, 255, 255, 0)" },
      hover: { backgroundColor: "rgba(226, 232, 240, 1)" },
    }),
    [isHighlighted]
  );

  return (
    <motion.div
      tabIndex={0}
      data-path={JSON.stringify(path)}
      data-id={element.id}
      className={`equation-element my-2 mr-2 flex w-auto items-center rounded-md p-2 ${
        element.latex?.trim() === "" ? "bg-gray-100" : "justify-center"
      } cursor-pointer`}
      animate={isHighlighted ? "highlighted" : "notHighlighted"}
      whileHover="hover"
      variants={fadeInOutVariants}
      // transition={{ duration: 0.3 }}
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
    </motion.div>
  );
}
