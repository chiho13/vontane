import styled from "styled-components";

export const GenerateButtonStyle = styled.button<any>`
  display: flex;
  font-weight: bold;
  height: 34px;
  cursor: ${({ isDisabled }) => (isDisabled ? "not-allowed" : "pointer")};

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    border: 2px solid #eeeeee;
  }
`;
