import React from "react";
import LoadingSpinner from "../../icons/LoadingSpinner";
import { GenerateButtonStyle } from "./style";
import { FileAudio } from "lucide-react";

interface GenerateButtonProps {
  isDisabled: boolean;
  audioIsLoading: boolean;
  onClick: () => void;
}

function GenerateButton({
  isDisabled,
  audioIsLoading,
  onClick,
}: GenerateButtonProps) {
  return (
    <GenerateButtonStyle
      isDisabled={isDisabled}
      onClick={onClick}
      disabled={isDisabled || audioIsLoading}
    >
      {audioIsLoading ? (
        <>
          <LoadingSpinner />
          {/* <div className="ml-2">Generating...</div> */}
        </>
      ) : (
        // <div>Text to Speech</div>
        <FileAudio />
      )}
    </GenerateButtonStyle>
  );
}

export default GenerateButton;
