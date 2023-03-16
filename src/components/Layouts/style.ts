import styled from "styled-components";

export const AccountLayoutStyle = styled.header`
  .dropdown_wrapper {
    line-height: 0;
    width: auto;
  }
  .dropdown-toggle.dropdown-toggle {
    padding: 0;
    border-color: #ffffff;
    position: relative;
    outline: none;
    border: none;
    box-shadow: none;
    background: none;
    padding: 5px;
    width: 100%;
    height: 45px;
    justify-content: initial;

    &:focus {
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.3);
    }

    &:hover {
      background: #eeeeee;
    }
  }
  .dropdown_textbutton.dropdown_textbutton {
    max-width: 100px;
  }
`;
