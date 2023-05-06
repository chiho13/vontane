import { useState, useEffect, useCallback, useRef } from "react";
import { DraggableCore } from "react-draggable";

const useResizeSidebar = (initialWidth, minSidebarWidth, maxSidebarWidth) => {
  const [sidebarWidth, setSidebarWidth] = useState(initialWidth);

  const handleDrag = useCallback(
    (e, ui) => {
      const newSidebarWidth = sidebarWidth - ui.deltaX;
      if (
        newSidebarWidth >= minSidebarWidth &&
        newSidebarWidth <= maxSidebarWidth
      ) {
        setSidebarWidth(newSidebarWidth);
      }
    },
    [sidebarWidth, minSidebarWidth, maxSidebarWidth]
  );

  return { sidebarWidth, handleDrag };
};

export default useResizeSidebar;
