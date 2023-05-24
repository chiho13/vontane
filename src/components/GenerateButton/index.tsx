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
      className="rounded-md border-2 bg-white  duration-200 disabled:opacity-50  dark:border-muted-foreground dark:bg-muted dark:text-foreground dark:hover:border-muted-foreground dark:hover:bg-muted-foreground dark:hover:text-background dark:disabled:border-gray-500 dark:disabled:bg-transparent  dark:disabled:text-gray-300 "
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
        <FileAudio />
      )}
    </GenerateButtonStyle>
  );
}

export default GenerateButton;
