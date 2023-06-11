import React from "react";
import styled from "styled-components";

const LoadingSpinnerSVG = styled.svg`
  z-index: 2;
`;

function LoadingSpinner({
  strokeColor = "stroke-gray-400 dark:stroke-white",
  width = 20,
  height = 20,
}) {
  return (
    <LoadingSpinnerSVG
      viewBox="0 0 50 50"
      className="animate-rotate"
      width={width}
      height={height}
    >
      <circle
        className={`animate-dash ${strokeColor}`}
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
      ></circle>
    </LoadingSpinnerSVG>
  );
}

export default LoadingSpinner;
