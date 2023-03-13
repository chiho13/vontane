import React from "react";

interface Props {
  theme: {
    colors: {
      brand: string;
      white: string;
    };
  };
}

export const PauseIcon = ({ theme }: Props) => (
  <svg
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="1.5"
    className="pause-icon w-10 h-10"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={theme.colors.brand}
      d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
    />
  </svg>
);
