export const TextIcon = ({
  strokeColor = "stroke-darkergray",
  width = 28,
  height = 28,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      className={strokeColor}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3,15 7,7 11,15"></polyline>
      <line x1="4" x2="10" y1="13" y2="13"></line>
      <circle cx="18" cy="12" r="3"></circle>
      <line x1="21" x2="21" y1="9" y2="15"></line>
    </svg>
  );
};
