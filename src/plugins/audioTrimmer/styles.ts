import styled from "styled-components";

const height = (props) => props.theme.audio?.mirtHeight || "60px";
const borderRadius = (props) => props.theme.audio?.mirtBorderRadius || "0.3rem";
const backgroundColor = (props) =>
  props.theme.audio?.mirtBackgroundColor || "#333";
const playheadWidth = (props) =>
  props.theme.audio?.mirtPlayheadWidth || "0.35rem";
const playheadColor = (props) => props.theme.audio?.mirtPlayheadColor || "#fff";
const frameBorderWidth = (props) =>
  props.theme.audio?.mirtFrameBorderWidth || "0.3rem";
const frameColor = (props) => props.theme.audio?.frameColor || "#409f80";
const handleWidth = (props) => props.theme.audio?.mirtHandleWidth || "1.2rem";
const handleIconColor = (props) =>
  props.theme.audio?.mirtHandleIconColor || "#333";
const handleIconWidth = (props) =>
  props.theme.audio?.mirtHandleIconWidth || "0.75rem";
const handleTransitionDuration = (props) =>
  props.theme.audio?.mirtHandleTransitionDuration || "500ms";
const buttonWidth = (props) => props.theme.audio?.mirtButtonWidth || "60px";
const buttonBorderColor = (props) =>
  props.theme.audio?.mirtButtonBorderColor || "#222";
const buttonHoverColor = (props) =>
  props.theme.audio?.mirtButtonHoverColor || "#444";
const buttonIconWidth = (props) =>
  props.theme.audio?.mirtButtonIconWidth || "1rem";
const buttonIconColor = (props) =>
  props.theme.audio?.mirtButtonIconColor || "#fff";

export const MirtStyle = styled.div`
  display: flex;
  background-color: ${backgroundColor};
  height: ${height};
  border-radius: ${borderRadius};
  overflow: hidden;
  user-select: none;

  .mirt__play-button {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: ${buttonWidth};
    background-color: ${backgroundColor};
    border-right-color: ${buttonBorderColor};
    border-width: 0 0.0625rem 0 0;
    cursor: default;

    .mirt--initialized & {
      cursor: pointer;

      &:hover {
        background-color: ${buttonHoverColor};
      }
    }
  }

  .mirt__play-button-icon {
    width: ${buttonIconWidth};
    color: ${buttonIconColor};

    .mirt--disabled & {
      opacity: 0.5;
    }
  }

  .mirt__timeline {
    position: relative;
    flex-grow: 1;
    overflow: hidden;
  }

  .mirt__range-handles {
    z-index: 300;
  }

  .mirt__range-handles,
  .mirt__range-handle-frame {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .mirt__range-handle-playhead-track {
    position: absolute;
    top: 0;
    right: calc(${handleWidth} - ${playheadWidth});
    bottom: 0;
    left: calc(${handleWidth} - ${playheadWidth});
  }

  .mirt__range-handle--start,
  .mirt__range-handle--end {
    z-index: 200;
    pointer-events: none;

    &::-moz-range-thumb {
      width: ${handleWidth};
      pointer-events: all;
    }

    &::-webkit-slider-thumb {
      width: ${handleWidth};
      pointer-events: all;
    }

    &::-ms-thumb {
      width: ${handleWidth};
      pointer-events: all;
    }

    &::-moz-range-track {
      pointer-events: none;
    }

    &::-webkit-slider-runnable-track {
      pointer-events: none;
    }

    &::-ms-track {
      pointer-events: none;
    }
  }

  .mirt__range-handle--start {
    padding-right: ${handleWidth};

    &::-moz-range-thumb {
      transform: translateX(calc(${playheadWidth} * -1));
      cursor: default;

      .mirt--initialized & {
        cursor: e-resize;
      }
    }

    &::-webkit-slider-thumb {
      transform: translateX(calc(${playheadWidth} * -1));
      cursor: default;

      .mirt--initialized & {
        cursor: e-resize;
      }
    }

    &::-ms-thumb {
      transform: translateX(calc(${playheadWidth} * -1));
      cursor: default;

      .mirt--initialized & {
        cursor: e-resize;
      }
    }
  }

  .mirt__range-handle--end {
    padding-left: ${handleWidth};

    &::-moz-range-thumb {
      transform: translateX(${playheadWidth});
      cursor: default;

      .mirt--initialized & {
        cursor: w-resize;
      }
    }

    &::-webkit-slider-thumb {
      transform: translateX(${playheadWidth});
      cursor: default;

      .mirt--initialized & {
        cursor: w-resize;
      }
    }

    &::-ms-thumb {
      transform: translateX(${playheadWidth});
      cursor: default;

      .mirt--initialized & {
        cursor: w-resize;
      }
    }
  }

  .mirt__range-handle--playhead {
    z-index: 100;
    pointer-events: none;

    &::-moz-range-thumb {
      width: calc(${playheadWidth} * 2);
      pointer-events: all;
      cursor: default;

      .mirt--initialized & {
        cursor: ew-resize;
      }
    }

    &::-webkit-slider-thumb {
      width: calc(${playheadWidth} * 2);
      pointer-events: all;
      cursor: default;

      .mirt--initialized & {
        cursor: ew-resize;
      }
    }

    &::-ms-thumb {
      width: calc(${playheadWidth} * 2);
      pointer-events: all;
      cursor: default;

      .mirt--initialized & {
        cursor: ew-resize;
      }
    }

    &::-moz-range-track {
      cursor: default;

      .mirt--initialized & {
        cursor: ew-resize;
      }
    }

    &::-webkit-slider-runnable-track {
      cursor: default;

      .mirt--initialized & {
        cursor: ew-resize;
      }
    }

    &::-ms-track {
      cursor: default;

      .mirt--initialized & {
        cursor: ew-resize;
      }
    }
  }

  .mirt__range-handle {
    position: absolute;
    left: 0;
    width: 100%;
    height: ${height};
    appearance: none;
    background-color: transparent;
    margin: 0;
    opacity: 0;
  }

  .mirt__range-handle::-moz-range-thumb {
    border-radius: 0;
    height: 100%;
    appearance: none;
  }

  .mirt__range-handle::-webkit-slider-thumb {
    border-radius: 0;
    height: 100%;
    appearance: none;
  }

  .mirt__range-handle::-ms-thumb {
    border-radius: 0;
    height: 100%;
    appearance: none;
  }

  .mirt__range-handle::-moz-range-track {
    height: ${height};
    background: transparent;
    appearance: none;
  }

  .mirt__range-handle::-webkit-slider-runnable-track {
    height: ${height};
    background: transparent;
    appearance: none;
  }

  .mirt__range-handle::-ms-track {
    height: ${height};
    background: transparent;
    appearance: none;
  }

  .mirt__range-handle::-moz-focus-outer {
    border: 0;
  }

  .mirt__range-handle:focus::-ms-thumb {
    border: 0;
  }

  .mirt__range-handle::-ms-tooltip {
    display: none;
  }

  .mirt__handles {
    position: absolute;
    top: 0;
    right: ${handleWidth};
    bottom: 0;
    left: ${handleWidth};
    z-index: 200;
  }

  .mirt__handle-frame {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: 0 calc(${handleWidth} * -1);
    border-top-width: ${frameBorderWidth};
    border-right-width: ${handleWidth};
    border-bottom-width: ${frameBorderWidth};
    border-left-width: ${handleWidth};
    border-style: solid;
    border-color: ${frameColor};
    border-radius: ${borderRadius};
    transition: left ${handleTransitionDuration} ease,
      right ${handleTransitionDuration} ease;

    &.mirt__handle-frame--start-dragging {
      transition: right ${handleTransitionDuration} ease;
    }

    &.mirt__handle-frame--end-dragging {
      transition: left ${handleTransitionDuration} ease;
    }

    &:before,
    &:after {
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      background-color: ${backgroundColor};
      opacity: 0.7;
      z-index: -1;
      content: "";
    }

    &:before {
      right: 100%;
      left: -9999px;
    }

    &:after {
      left: 100%;
      right: -9999px;
    }
  }

  .mirt__playhead-track {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .mirt__playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: calc(${playheadWidth} * 2);
    transform: translateX(calc(${playheadWidth} * -1));
    transition: left ${handleTransitionDuration} ease;

    &.mirt__playhead--dragging {
      transition: none;
    }

    &:before {
      display: block;
      position: absolute;
      top: calc(${frameBorderWidth} / 2);
      bottom: calc(${frameBorderWidth} / 2);
      left: 50%;
      width: ${playheadWidth};
      transform: translateX(-50%);
      background-color: ${playheadColor};
      border-radius: calc(${playheadWidth} / 2);
      content: "";
    }
  }

  .mirt__handle-icon {
    position: absolute;
    top: 50%;
    width: ${handleIconWidth};
    color: ${handleIconColor};
    pointer-events: none;

    .mirt--disabled & {
      opacity: 0.5;
    }
  }

  .mirt__handle-icon--start {
    left: calc(${handleWidth} / -2);
    transform: translate(-50%, -50%);
  }

  .mirt__handle-icon--end {
    right: calc(${handleWidth} / -2);
    transform: translate(50%, -50%);
  }

  .mirt__waveform {
    position: absolute;
    top: ${frameBorderWidth};
    right: ${handleWidth};
    bottom: ${frameBorderWidth};
    left: ${handleWidth};
    z-index: 100;
  }

  .mirt__waveform-canvas {
    width: 100%;
    height: 100%;
  }
`;
