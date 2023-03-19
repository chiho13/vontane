// EquationBlock.jsx
import React from "react";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const EquationBlock = ({ equation, isBlock }) => {
  return isBlock ? (
    <BlockMath math={equation} />
  ) : (
    <InlineMath math={equation} />
  );
};

export default EquationBlock;
