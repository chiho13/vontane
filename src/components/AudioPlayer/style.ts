import styled, { StyledComponent } from "styled-components";

export const AudioPlayerStyle: StyledComponent<"div", any> = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  max-width: 500px;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #eeeeee;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  background: ${(props) => props.theme.background.white};}

  .audioPlayer_current-time, .audioPlayer_max-time {
    display: block;
    font-size: 14px;
    margin-left: 10px;
    width: 35px
  }
    
  .audioPlayer_timeline_container {
    position: relative;
    top: 1px;
    height: 20px;
    width: 100%;
    background: transparent;
    display: flex;
    align-items: center;
    margin-left: 16px;

    &:hover .audioPlayer_timeline_track {
        background-color: ${(props) => props.theme.colors.brand};
      }
  }

  .audioPlayer_timeline {
    width: 100%;
    height: 6px;
    background-color: #cccccc;
    position: relative;
    cursor: pointer;
    border-radius: 3px;
   
  } 



  .audioPlayer_timeline_track {
    height: 6px;
    background-color: #777777;
    position: absolute;
    top: 0;
    left: 0;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    -webkit-backface-visibility: hidden

    .finished & {
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
    }
  }

  .audioPlayer_nib {
    display: block;
    width: 14px;
    height: 14px;
    background-color: white;
    border: 1px solid #cccccc;
    position: absolute;
    top: -4px;
    border-radius: 50%;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
  
  .play_pause_button:active .play-icon {
    transform: scale(0.9);
  }

  .play_pause_button:active .pause-icon {
    transform: scale(0.9);
  }
  
  .play-icon, .pause-icon {
    transition: transform 0.1s ease-in-out;
  }

`;
