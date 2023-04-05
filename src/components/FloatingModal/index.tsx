import React, { useState, useRef } from "react";
import { Grip } from "lucide-react";
interface FloatingModalProps {
  title: string;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
}

export const FloatingModal: React.FC<FloatingModalProps> = ({
  title,
  children,
  initialX = 0,
  initialY = 0,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const modalRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  let dragStart = { x: 0, y: 0 };

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
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
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
    <div
      ref={modalRef}
      className="fixed w-72 rounded border border-gray-300 bg-white p-4 shadow-md"
      style={{ left: position.x, top: position.y }}
    >
      <div className="mb-2 flex select-none items-center font-bold">
        <div className="mr-1 cursor-move rounded p-1 text-gray-500 hover:bg-gray-100">
          <Grip width={12} height={12} onMouseDown={handleMouseDown} />
        </div>
        <span className="text-gray-500">{title}</span>
      </div>
      <div className="overflow-auto">{children}</div>
    </div>
  );
};
