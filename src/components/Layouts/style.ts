import styled from "styled-components";

export const AccountLayoutStyle = styled.header`
  .dropdown_wrapper {
    line-height: 0;
    width: 100%;
  }
  .dropdown-toggle.dropdown-toggle {
    padding: 0;
    border-color: #ffffff;
    position: relative;
    outline: none;
    border: none;
    box-shadow: none;
    background: none;
    padding: 10px;
    width: 100%;
    height: 47px;
    justify-content: initial;
    transition: background 300ms ease;

    &:focus {
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.3);
    }

    &:hover {
      background: ${({ theme }) => theme.colors.gray};
    }
  }

  .dropdown-menu.dropdown-menu {
    left: 18px;
  }

  .dropdown_textbutton.dropdown_textbutton {
    max-width: 100px;
    margin-right: 8px;
    margin-left: 8px;
  }
`;
