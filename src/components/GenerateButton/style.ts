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
  padding: 8px 16px;
  border-radius: 0.25rem;
  margin-top: 16px;
  opacity: ${({ isDisabled }) => (isDisabled ? "0.5" : "1")};
  cursor: ${({ isDisabled }) => (isDisabled ? "not-allowed" : "pointer")};
  transition: border 0.3s ease-in-out, opacity 0.3s ease, color 0.3s ease;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

  &:hover {
    background-color: #fefefe;
    color: #f5820d;
  }

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    border: 2px solid #eeeeee;
  }
`;
