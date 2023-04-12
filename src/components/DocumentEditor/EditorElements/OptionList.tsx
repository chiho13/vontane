import React from "react";
import styled from "styled-components";

const OptionListStyle = styled.ol`
  list-style-type: upper-alpha;
  padding-left: 0;
`;
interface OptionListProps {
  attributes: any;
  children: React.ReactNode;
}

export const OptionList: React.FC<OptionListProps> = ({
  attributes,
  children,
}) => {
  return (
    <OptionListStyle {...attributes} className="mt-4">
      {children}
    </OptionListStyle>
  );
};
