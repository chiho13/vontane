import { EditorContext } from "@/contexts/EditorContext";
import { useContext, useState } from "react";
import { ReactEditor } from "slate-react";

// This hook takes an array of actions (like your changeBlockElements array) and a callback to close the dropdown
export function useArrowNavigation(
  elements: any,
  initialIndex: number,
  closeDropdown
) {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);

  const handleArrowNavigation = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Tab"
    ) {
      event.preventDefault();

      // Calculate new index based on key pressed
      let newIndex;
      if (
        event.key === "ArrowDown" ||
        (!event.shiftKey && event.key === "Tab")
      ) {
        newIndex = (focusedIndex + 1) % elements.length;
      } else {
        newIndex =
          focusedIndex - 1 < 0 ? elements.length - 1 : focusedIndex - 1;
      }

      // Skip over separators
      while (elements[newIndex] === "separator") {
        if (
          event.key === "ArrowDown" ||
          (!event.shiftKey && event.key === "Tab")
        ) {
          newIndex = (newIndex + 1) % elements.length;
        } else {
          newIndex = newIndex - 1 < 0 ? elements.length - 1 : newIndex - 1;
        }
      }

      setFocusedIndex(newIndex);
    } else if (event.key === "Enter") {
      event.stopPropagation();
      event.preventDefault();
      if (elements[focusedIndex] && elements[focusedIndex] !== "separator") {
        elements[focusedIndex].action();
        closeDropdown(focusedIndex);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown(focusedIndex);
    }
  };

  return { focusedIndex, setFocusedIndex, handleArrowNavigation };
}
