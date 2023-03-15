import styled from "styled-components";

export const AccountLayoutStyle = styled.header`
  .dropdown_wrapper {
    line-height: 0;
  }
  .dropdown-toggle {
    border-radius: 50%;
    padding: 0;
    border-color: #ffffff;
    position: relative;
    outline: none;

    &:focus {
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.3);
    }
  }

  .dropdown-menu {
    width: 200px;
  }
`;
