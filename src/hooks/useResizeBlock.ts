import { useState, useRef, useCallback, useEffect } from "react";
import { Transforms } from "slate";

export const useResizeBlock = (element, editor, path) => {
  const [isResizing, setIsResizing] = useState(false);
  const [blockWidth, setWidth] = useState(element.width || 0);
  const [pos, setPos] = useState("left");
  const ref = useRef<any>(null);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(
    (e) => {
      setIsResizing(false);
      const newElement = { ...element, width: blockWidth };

      Transforms.setNodes(editor, newElement, { at: path });
    },
    [blockWidth, element, editor, path]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isResizing) {
        let newWidth;
        if (pos === "left") {
          newWidth = ref.current?.getBoundingClientRect().right - e.clientX;
        } else {
          newWidth = e.clientX - ref.current.getBoundingClientRect().left;
        }

        if (newWidth < 250) {
          setWidth(250);
        } else {
          setWidth(newWidth);
        }
      }
    },
    [isResizing, pos, ref]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return { handleMouseDown, setPos, ref, blockWidth };
};
