import { useState } from "react";

// This hook takes an array of actions (like your changeBlockElements array) and a callback to close the dropdown
export function useArrowNavigation(
  elements: any[],
  initialIndex: number,
  closeDropdown
) {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);

  const handleArrowNavigation = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((prevIndex) => (prevIndex + 1) % elements.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((prevIndex) =>
        prevIndex - 1 < 0 ? elements.length - 1 : prevIndex - 1
      );
    } else if (event.key === "Tab") {
      event.preventDefault();
      if (event.shiftKey) {
        setFocusedIndex((prevIndex) =>
          prevIndex - 1 < 0 ? elements.length - 1 : prevIndex - 1
        );
      } else {
        setFocusedIndex((prevIndex) => (prevIndex + 1) % elements.length);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (elements[focusedIndex]) {
        elements[focusedIndex].action();
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
    }
  };

  return { focusedIndex, setFocusedIndex, handleArrowNavigation };
}
