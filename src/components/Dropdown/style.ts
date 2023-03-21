import styled, { StyledComponent } from "styled-components";

export const DropdownStyle: StyledComponent<"div", any> = styled.div`
  position: relative;

  .dropdown-menu {
    border: 1px solid #aaaaaa;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
  }

  .dropdown_textbutton {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dropdown-toggle {
    border-color: #eeeeee;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

    &:focus {
      border-color: ${(props) => props.theme.colors.gray};
    }
  }
`;
