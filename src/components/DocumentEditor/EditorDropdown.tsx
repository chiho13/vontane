import React, { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const y_animation_props = {
  animate: {
    opacity: 1,
    y: 0,
  },
  initial: {
    opacity: 0,
    y: "-10px",
  },
  transition: {
    duration: 0.2,
  },
  enter: {
    opacity: 1,
    display: "block",
    transition: {
      duration: 0.6,
    },
    transitionEnd: {
      display: "none",
    },
  },
  exit: {
    opacity: 0,
    y: "-10px",
    transition: {
      duration: 0.2,
    },
    transitionEnd: {
      display: "none",
    },
  },
};

export const EditorDropdown = ({
  showDropdown,
  setShowDropdown,
  dropdownTop,
  dropdownLeft,
  activePath,
  children,
}) => {
  const dropdownRef = useRef();

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  return (
    <AnimatePresence>
      {showDropdown && activePath && (
        <>
          <motion.div
            {...y_animation_props}
            ref={dropdownRef}
            className="fixed left-[120px] z-10 mx-auto mt-2 w-full"
            style={{
              top: `${dropdownTop}px`,
              left: `${dropdownLeft}px`,
            }}
          >
            {children}
          </motion.div>
          <div
            tabIndex={0}
            onClick={closeDropdown}
            className="closeOutside fixed bottom-0 left-0 h-screen w-screen opacity-50"
            style={{
              height: "calc(100vh - 50px",
            }}
          ></div>
        </>
      )}
    </AnimatePresence>
  );
};
