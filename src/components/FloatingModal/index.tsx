import React, { useState, useRef } from "react";

interface FloatingModalProps {
  title: string;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
}

const FloatingModal: React.FC<FloatingModalProps> = ({
  title,
  children,
  initialX = 0,
  initialY = 0,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const modalRef = useRef<HTMLDivElement>(null);
  let dragging = false;
  let dragStart = { x: 0, y: 0 };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging = true;
    dragStart = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseUp = () => {
    dragging = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
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
      className="absolute w-72 rounded border border-gray-300 bg-white p-4 shadow-md"
      style={{ left: position.x, top: position.y }}
    >
      <div
        className="mb-2 cursor-move select-none font-bold"
        onMouseDown={handleMouseDown}
      >
        {title}
      </div>
      <div className="overflow-auto">{children}</div>
    </div>
  );
};

export default FloatingModal;
