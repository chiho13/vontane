import { useEffect } from "react";

type EventHandler = (event: MouseEvent) => void;

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  ignoreInsideClick: (element: HTMLElement) => boolean
) => {
  const handleClick = (e: MouseEvent) => {
    if (
      ref.current &&
      !ref.current.contains(e.target as Node) &&
      !ignoreInsideClick(e.target as HTMLElement)
    ) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref, callback]);
};

export default useClickOutside;
