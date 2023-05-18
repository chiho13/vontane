import styled, { StyledComponent } from "styled-components";

interface GenerateButtonStyleProps {
  isDisabled: boolean;
}

export const GenerateButtonStyle: StyledComponent<
  "button",
  any,
  GenerateButtonStyleProps
> = styled.button<GenerateButtonStyleProps>`
  display: flex;
  align-items: center;

  font-weight: bold;
  padding: 10px 10px;
  width: 42px;
  height: 40px;
  cursor: ${({ isDisabled }) => (isDisabled ? "not-allowed" : "pointer")};

  &:hover {
    background-color: #fefefe;
  }

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    border: 2px solid #eeeeee;
  }
`;
