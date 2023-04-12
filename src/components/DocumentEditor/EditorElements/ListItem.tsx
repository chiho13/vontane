import React from "react";

interface ListItemProps {
  attributes: any;
  children: React.ReactNode;
  correctAnswer: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  element,
  attributes,
  children,
}) => {
  const [selected, setSelected] = React.useState(element.correctAnswer);

  const handleRadioChange = () => {
    setSelected(!selected);
  };
  return (
    <li {...attributes} className="ml-10">
      {children}
      {/* {element.correctAnswer && <span className="text-green-500">✔</span>} */}
    </li>
  );
};
