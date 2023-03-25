// EquationBlock.tsx
import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface EquationBlockProps {
  equation: string;
  isBlock: boolean;
}

const EquationBlock: React.FC<EquationBlockProps> = ({ equation, isBlock }) => {
  console.log("lol");
  return isBlock ? (
    <BlockMath math={equation} />
  ) : (
    <InlineMath math={equation} />
  );
};

export default EquationBlock;
