import React from "react";

interface MCQElementProps {
  attributes: any;
  children: React.ReactNode;
}

export const MCQElement: React.FC<MCQElementProps> = ({
  attributes,
  children,
}) => {
  return (
    <div {...attributes} className="mcq-element rounded-md bg-gray-100 p-4">
      {children}
    </div>
  );
};
