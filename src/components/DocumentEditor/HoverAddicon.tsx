import React from "react";
import { Plus } from "lucide-react";

interface HoverIconProps {
  onClick: () => void;
  onMouseOver: () => void;
  onMouseLeave: () => void;
}

const HoverIcon: React.FC<HoverIconProps> = ({
  onClick,
  onMouseOver,
  onMouseLeave,
}) => {
  return (
    <div
      className="hover-icon"
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
      style={{
        position: "absolute",
        left: "-25px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer",
      }}
    >
      <Plus />
    </div>
  );
};

export default HoverIcon;
