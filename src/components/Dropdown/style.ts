import styled, { StyledComponent } from "styled-components";
import { mq } from "@/utils/breakpoints";

export const DropdownStyle: StyledComponent<"div", any> = styled.div`
  position: relative;


  .dropdown-menu {
    // border-top: 1px solid #aaaaaa;
   
    bottom: 0;
    z-index 1000;
    
    ${mq.lg`
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
