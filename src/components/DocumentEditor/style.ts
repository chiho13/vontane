import styled, { StyledComponent } from "styled-components";

export const BlockContainer: StyledComponent<"div", any> = styled.div`
  position: relative;

  &:hover::before {
    content: "Add equation";
    position: absolute;
    left: -110px;
    top: 50%;
    transform: translateY(-50%);
    background-color: #eee;
    border-radius: 3px;
    padding: 5px;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;
