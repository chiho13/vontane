export const SlideBreak = ({ strokeColor = "currnetColor" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2"></rect>
      <path d="M14 15h1"></path>
      <path d="M19 15h2"></path>
      <path d="M3 15h2"></path>
      <path d="M9 15h1"></path>
    </svg>
  );
};