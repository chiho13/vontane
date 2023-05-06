import { useState, useEffect, useCallback, useRef } from "react";
import { DraggableCore } from "react-draggable";

const useResizeSidebar = (initialWidth, minSidebarWidth, maxSidebarWidth) => {
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);
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

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const content = contentRef.current;
    if (sidebar) {
      sidebar.style.width = `${sidebarWidth}px`;
    }

    // if(content) {
    //     content.style.width = `${1400 - sidebarWidth}px`;
    // }
  }, [sidebarWidth]);

  return { contentRef, sidebarRef, sidebarWidth, handleDrag };
};

export default useResizeSidebar;
