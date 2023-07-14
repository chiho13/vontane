import React, { MouseEventHandler } from "react";
import LoadingSpinner from "../../icons/LoadingSpinner";
import { GenerateButtonStyle } from "./style";
import { ImPlay3 } from "react-icons/im";
import { Button } from "@/components/ui/button";
import { useTextSpeech } from "@/contexts/TextSpeechContext";

interface GenerateButtonProps {
  isDisabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  element: any;
}

function GenerateButton({ isDisabled, onClick, element }: GenerateButtonProps) {
  const { rightBarAudioIsLoading } = useTextSpeech();
  return (
    <GenerateButtonStyle
      className="items-center justify-center rounded-md border border-foreground bg-background  p-0 px-2 text-foreground hover:border-gray-700 hover:bg-slate-100 hover:text-gray-700 dark:border-muted-foreground dark:bg-background dark:text-foreground dark:hover:bg-muted  "
      isDisabled={isDisabled}
      onClick={onClick}
      disabled={isDisabled || rightBarAudioIsLoading[element.id]}
    >
      {true ? (
        <>
          <LoadingSpinner strokeColor="stroke-gray-800 dark:stroke-white" />
          {/* <div className="ml-2 text-sm">Generating</div> */}
        </>
      ) : (
        // <ImPlay3 width={40} />
        <span className="text-sm">
          {element.file_name ? "Re-Generate" : "Generate"}
        </span>
      )}
    </GenerateButtonStyle>
  );
}

export default GenerateButton;
