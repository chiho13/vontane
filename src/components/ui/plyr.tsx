import styled from "styled-components";

export const StyledPlyr = styled.div`
  .plyr--audio .plyr__controls {
    gap: 5px;
    background: transparent;
  }

  .plyr--audio .plyr__control:hover,
  .plyr__control:focus-visible,
  .plyr--audio .plyr__control[aria-expanded="true"] {
    background: #eeeeee;
    opacity: 0.9;
    svg {
      fill: ${(props) => props.theme.brandColor} !important;
    }

    * {
      color: #333333;
    }

    .dark & {
      background: #333333;

      svg {
        fill: #f1f1f1 !important;
      }
    }
  }

  .plyr__control:focus-visible {
    outline: 2px dashed ${(props) => props.theme.brandColor};
  }
  .plyr__control svg {
    fill: ${(props) => props.theme.brandColor};
  }

  .plyr--audio .plyr__control {
    border-radius: 6px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    svg {
      width: 16px;
    }
  }
  .plyr--audio .plyr__control[data-plyr="play"] {
    border-radius: 6px;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #eeeeee;

    .dark & {
      border: 1px solid #333333;
    }
    svg {
      width: 16px;
    }
  }

  .plyr__control svg {
    .dark & {
      fill: #f1f1f1;
    }
  }

  .plyr__time {
    .dark & {
      color: #ffffff;
    }
  }

  .plyr__control:hover svg {
    fill: ${(props) => props.theme.brandColor};
  }

  .plyr--audio .plyr__control[aria-expanded="true"] svg {
    fill: ${(props) => props.theme.brandColor};
  }

  .plyr__control:focus-visible svg {
    fill: ${(props) => props.theme.brandColor};
  }

  .plyr--full-ui input[type="range"] {
    color: ${(props) => props.theme.brandColor};
  }

  @media (max-width: 767px) {
    .plyr__time + .plyr__time {
      display: block;
    }
  }
`;
