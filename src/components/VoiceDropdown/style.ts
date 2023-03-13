import styled from "styled-components";

export const VoiceDropdownStyle = styled.div`
  position: relative;
  margin-bottom: 20px;

  .filter_label {
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    padding-bottom: 0;
    padding-left: 40px;
    padding-right: 40px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;

    span {
      margin-right: 16px;
    }
  }

  .filter_pill {
    padding: 5px 9px;
  }
 
  .close-icon:hover path {
    stroke: #888888;
    transition: stroke 0.3s ease;
  }
  
  .filter_noResult {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 370px;
  }

  .dropdown_table {
    border-collapse: separate;
    border-spacing: 0;
   
  }

  .dropdown_table_wrapper {
    display: block;
    min-height 450px;
    max-height: 500px;
    overflow-y: scroll;
  }

  .dropdown_table_wrapper::-webkit-scrollbar {
    width: 10px;
    height: 10px;
    border-radius: 5px;
  }
  
  .dropdown_table_wrapper::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 5px;
  }
  
  .dropdown_table_wrapper::-webkit-scrollbar-thumb {
    background: #aaaaaa;
    border-radius: 5px;
  }
  
  .dropdown_table_wrapper::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  .show {
    display: block;
  }

  .play-icon,
  .stop-icon {
    cursor: pointer;
    width: 34px;
    height: 34px;
  }

  .flag-icon {
    margin-right: 10px;
  }

  .play-icon path,
  .stop-icon path {
    stroke: #777777;
  }

  .play-icon:hover path,
  .stop-icon:hover path {
    stroke: #f07d3b;
    transition: stroke 0.3s ease;
  }

  .play-icon path,
  .stop-icon path {
    pointer-events: none;
  }

  .voiceItem_wrapperMargin {
    margin-top: 10px;
    display: contents;
  }

  .voiceItemContainer {
    padding-left: 10px;
    cursor: pointer;
    position: relative;
    top: 10px;

    td {
      border-bottom: 1px solid #e6ebf4;
      text-transform: capitalize;
    }
  }
  .voiceItemContainer:hover {
    background-color: #eeeeee;
    transition: all 0.3s ease;
  }

  .nameHeader {
    text-indent: 74px;
  }

  thead {
    padding: 1rem;
  }

  tr {
    padding: 0.5rem;
  }

  th,
  td {
    text-align: left;
    padding: 10px;
  }

  .voiceTitles {
    position: sticky;
    top: 0;

    z-index: 100;

    tr:first-child th {
      padding: 0;
      background: #ffffff;
    }

    tr:first-child th:first-child {
      
      border-top-left-radius: 4px;
    }

    tr:first-child th:last-child {
      
      border-top-right-radius: 4px;
    }

    tr:last-child th {
      padding-top: 20px;
      padding-bottom: 20px;
      min-width: 100px;
      border-bottom: 2px solid #333333;
    }
  }

  .voiceSampleAndName {
    padding-left: 20px;
  }

  .closeOutside {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(109.6deg, rgb(20, 30, 48) 11.2%, rgb(36, 59, 85) 91.1%);
    opacity: 0.5;
  }
`;
