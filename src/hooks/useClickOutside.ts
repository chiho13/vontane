import { useEffect, useCallback } from "react";

type EventHandler = (event: MouseEvent) => void;

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  toggleRef: React.RefObject<HTMLElement>
) => {
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        (!toggleRef.current || !toggleRef.current.contains(e.target as Node))
      ) {
        callback();
      }
    },
    [ref, callback, toggleRef]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref, callback]);
};

export default useClickOutside;
