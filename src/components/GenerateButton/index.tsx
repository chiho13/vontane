import React from "react";
import LoadingSpinner from "../../icons/LoadingSpinner";
import { GenerateButtonStyle } from "./style";
import { ImPlay3 } from "react-icons/im";
import { Button } from "@/components/ui/button";

interface GenerateButtonProps {
  isDisabled?: boolean;
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
      className="items-center justify-center rounded-md border-2 border-foreground  p-0 text-foreground hover:border-gray-700 hover:bg-white hover:text-gray-700 dark:border-muted-foreground dark:bg-secondary dark:text-foreground dark:hover:bg-muted  "
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
        <ImPlay3 width={40} />
      )}
    </GenerateButtonStyle>
  );
}

export default GenerateButton;
