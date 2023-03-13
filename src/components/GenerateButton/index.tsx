import React from "react";
import LoadingSpinner from "../../icons/LoadingSpinner";
import { GenerateButtonStyle } from "./style";

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
          <div>Generating...</div>
        </>
      ) : (
        <div>Generate</div>
      )}
    </GenerateButtonStyle>
  );
}

export default GenerateButton;
