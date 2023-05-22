import { useState, useEffect, useCallback, useRef } from "react";

const useResizeElement = (initialWidth, minSidebarWidth, maxSidebarWidth) => {
  const [elementWidth, setSidebarWidth] = useState(initialWidth);
  const [isDraggingRightSideBar, setIsDragging] = useState(false);
  const handleDrag = useCallback(
    (e, ui) => {
      const newSidebarWidth = elementWidth - ui.deltaX;
      if (
        newSidebarWidth >= minSidebarWidth &&
        newSidebarWidth <= maxSidebarWidth
      ) {
        setSidebarWidth(newSidebarWidth);
        setIsDragging(true);
      }
    },
    [elementWidth, minSidebarWidth, maxSidebarWidth]
  );

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  return { elementWidth, handleDrag, handleDragStop, isDraggingRightSideBar };
};

export default useResizeElement;
