import styled, { StyledComponent } from "styled-components";
import { mq } from "@/utils/breakpoints";

export const DropdownStyle: StyledComponent<"div", any> = styled.div`
  position: relative;

  .dropdown-menu {
    border-top: 1px solid #aaaaaa;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
    bottom: 0;
    z-index 1000;
    
    ${mq.lg`
    border: 1px solid #aaaaaa;
      bottom: revert;
    `}
  }

  .dropdown_textbutton {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

`;
