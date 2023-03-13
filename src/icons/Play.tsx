import React from "react";

interface Props {
  theme: {
    colors: {
      brand: string;
      white: string;
    };
  };
}

export const PlayIcon = ({ theme }: Props) => {
  return (
    <svg
      fill={theme.colors.brand}
      viewBox="0 0 24 24"
      strokeWidth={1}
      stroke="currentColor"
      className="play-icon w-10 h-10"
    >
      <path
        className="round-circle"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={theme.colors.brand}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <path
        className="play-shape"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={theme.colors.white}
        fill={theme.colors.white}
        d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
      />
    </svg>
  );
};
