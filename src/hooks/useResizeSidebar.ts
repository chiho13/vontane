import { useState, useEffect, useCallback, useRef } from "react";
import { DraggableCore } from "react-draggable";

const useResizeSidebar = (initialWidth, minSidebarWidth, maxSidebarWidth) => {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth);
  const [isDraggingRightSideBar, setIsDragging] = useState(false);
  const handleDrag = useCallback(
    (e, ui) => {
      const newSidebarWidth = sidebarWidth - ui.deltaX;
      if (
        newSidebarWidth >= minSidebarWidth &&
        newSidebarWidth <= maxSidebarWidth
      ) {
        setSidebarWidth(newSidebarWidth);
        setIsDragging(true);
      }
    },
    [sidebarWidth, minSidebarWidth, maxSidebarWidth]
  );

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  return { sidebarWidth, handleDrag, handleDragStop, isDraggingRightSideBar };
};

export default useResizeSidebar;
