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
  background-color: #fff;
  color: #777777;
  border: 2px solid #dddddd;
  font-weight: bold;
  padding: 10px 10px;
  width: 44px;
  height: 44px;
  border-radius: 0.25rem;
  opacity: ${({ isDisabled }) => (isDisabled ? "0.5" : "1")};
  cursor: ${({ isDisabled }) => (isDisabled ? "not-allowed" : "pointer")};
  transition: border 0.3s ease-in-out, opacity 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #fefefe;
    color: ${(props) => props.theme.colors.brand};
  }

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    border: 2px solid #eeeeee;
  }
`;
