import React, { useState, useRef } from "react";
import { Grip, X } from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "styled-components";
interface FloatingModalProps {
  title: string;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  onClose: () => void;
}

const down_animation_props = {
  animate: {
    opacity: 1,
    y: 0,
  },
  initial: {
    opacity: 0,
    y: "10px",
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
    y: "10px",
    transition: {
      duration: 0.2,
    },
    transitionEnd: {
      display: "none",
    },
  },
};

export const FloatingModal: React.FC<FloatingModalProps> = ({
  title,
  children,
  initialX = 0,
  initialY = 0,
  onClose,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [showFloatingModal, setShowFloatingModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  let dragStart = { x: 0, y: 0 };

  const theme = useTheme();

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    dragStart = {
      x: e.clientX - modalRef.current.offsetLeft,
      y: e.clientY - modalRef.current.offsetTop,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging.current) {
      setPosition({
        x: e.clientX - dragStart.x - window.pageXOffset,
        y: e.clientY - dragStart.y - window.pageYOffset,
      });
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };
  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        {...down_animation_props}
        ref={modalRef}
        className="fixed z-10 min-w-[550px] max-w-[900px] rounded border border-gray-300 bg-white p-4 shadow-md"
        style={{ left: position.x, top: position.y }}
      >
        <X
          className="absolute right-2 top-2 cursor-pointer"
          onClick={onClose}
          color={theme.colors.darkgray}
        />
        <div className="mb-2 flex select-none items-center font-bold">
          <div className="mr-1 cursor-move rounded p-1 text-gray-500 hover:bg-gray-100">
            <Grip width={12} height={12} onMouseDown={handleMouseDown} />
          </div>
          <span className="text-gray-500">{title}</span>
        </div>
        <div className="overflow-auto">{children}</div>
      </motion.div>
    </AnimatePresence>
  );
};
