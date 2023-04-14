import React from "react";
import styled from "styled-components";

const OptionListStyle = styled.ol`
  list-style-type: upper-alpha;
  list-style-position: inside;
  padding-left: 0;
  display: grid;
  grid-gap: 8px;
`;

const InstructionMessage = styled.p`
  font-style: italic;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
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
    <div>
      <InstructionMessage>
        You can edit the correct solution below
      </InstructionMessage>
      <OptionListStyle {...attributes} className="mt-4">
        {children}
      </OptionListStyle>
    </div>
  );
};
