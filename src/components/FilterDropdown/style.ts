import styled, { StyledComponent } from "styled-components";

export const FilterDropdownStyle: StyledComponent<"div", any> = styled.div`
  position: relative;

  .dropdown-menu.dropdown-menu {
    z-index: 1000;
    max-height: none !important;
    overflow-y: visible !important;
    bottom: revert;
  }

  button.dropdown-toggle {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 0;
    box-shadow: none;
  }

  .filter_optionItems {
    text-transform: capitalize;
    &:hover {
      background-color: #eee;
      transition: all 0.3s ease;
    }

    img {
      margin-right: 10px;
    }
  }
`;
