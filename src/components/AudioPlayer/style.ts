import styled, { StyledComponent } from "styled-components";

export const AudioPlayerStyle: StyledComponent<"div", any> = styled.div`
  position: relative;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 8px;

  .audioPlayer_current-time,
  .audioPlayer_max-time {
    display: block;
    font-size: 14px;
    width: 35px;
  }

  .audioPlayer_timeline_container {
    position: relative;
    top: 1px;
    height: 20px;
    flex-grow: 1;
    background: transparent;
    display: flex;
    align-items: center;
    margin-left: 8px;
    cursor: pointer;
  }

  .audioPlayer_timeline {
    width: 100%;
    height: 4px;
    position: relative;

    border-radius: 3px;
  }

  .audioPlayer_timeline_track {
    height: 4px;
    position: absolute;
    top: 0;
    left: 0;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    -webkit-backface-visibility: hidden .finished & {
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
    }
  }

  .audioPlayer_nib {
    display: block;
    width: 10px;
    height: 10px;
    background-color: white;
    border: 1px solid #cccccc;
    position: absolute;
    top: -3px;
    border-radius: 50%;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .play_pause_button:active .play-icon {
    transform: scale(0.9);
  }

  .play_pause_button:active .pause-icon {
    transform: scale(0.9);
  }

  .play-icon,
  .pause-icon {
    transition: transform 0.1s ease-in-out;
  }
`;
