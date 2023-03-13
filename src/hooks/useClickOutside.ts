import { useEffect } from "react";

type EventHandler = (event: MouseEvent) => void;

function useClickOutsideHandler(
  ref: React.RefObject<HTMLElement>,
  handleClickOutside: EventHandler
) {
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      handleClickOutside(event);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [ref, handleClickOutside]);
}

export default useClickOutsideHandler;
