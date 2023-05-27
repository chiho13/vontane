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
  font-weight: bold;
  width: 40px;
  height: 34px;
  cursor: ${({ isDisabled }) => (isDisabled ? "not-allowed" : "pointer")};

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    border: 2px solid #eeeeee;
  }
`;
