import React, { useEffect, useState } from "react";
import { CornerDownLeft, Send, Info, FileText } from "lucide-react";
import { useTheme } from "styled-components";
import { api } from "@/utils/api";
import LoadingSpinner from "@/icons/LoadingSpinner";
import styled from "styled-components";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EditBlockPopupStyle = styled.div`
  .indent-text ::placeholder {
    text-indent: 24px;
  }

  .indent-text {
    text-indent: 24px;
  }

  .insert-text {
    background-color: #f1f1f1;
  }

  .insert-text:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .insert-text:not([disabled]):hover {
    background-color: #ffffff;
  }
`;

interface EditBlockPopupProps {
  onChange: (value: string) => void;
  onClick: () => void;
  insertText: (note: string) => void;
  latexValue: string;
}

const InfoToolTip = () => {
  const theme = useTheme();

  return (
    <div className="absolute left-[10px] flex items-center">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>
            <div className="cursor-pointer rounded-full transition duration-200 hover:bg-gray-200">
              <Info color={theme.colors.darkgray} width={20} />
            </div>
          </TooltipTrigger>
          <TooltipContent className="w-[120px] border-black" side="left">
            <p className="text-[12px] text-white">
              <span className="text-bold">Disclaimer:</span> The results may not
              be accurate
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

function preprocessResponse(responseString: string) {
  const processedString = responseString.replace(
    /([^\\])\\([^\\])/g,
    "$1\\\\$2"
  );
  return processedString;
}

export const EditBlockPopup = React.forwardRef<
  HTMLDivElement,
  EditBlockPopupProps
>(({ onChange, onClick, insertText, latexValue }, ref) => {
  const [value, setValue] = useState(latexValue);
  const [findEquation, setFindEquation] = useState("");
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const [noteResults, setNoteResults] = useState(null);
  const [noteInserted, setNoteInserted] = useState(false);

  useEffect(() => {
    setValue(latexValue);
  }, [latexValue]);

  const onEquationChange = (e) => {
    console.log(e.target.value);
    setValue(e.target.value);
    onChange(e.target.value);
  };

  const {
    data: getEquationData,
    error: getEquationDataError,
    isLoading: getEquationisLoading,
    refetch: getEquationRefetch,
  } = api.gpt.getEquation.useQuery(
    { equationName: findEquation },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (!getEquationisLoading) {
      if (getEquationData) {
        console.log(getEquationData);
        // const correctedJsonString = getEquationData.replace(/\\\\/g, "\\");
        // console.log("corrected", correctedJsonString);
        const processedString = preprocessResponse(getEquationData);
        let jsonData;
        console.log("result", getEquationData);
        console.log("processed", processedString);

        try {
          jsonData = JSON.parse(processedString);
          setValue(jsonData.result);
          onChange(jsonData.result);
          setNoteResults(jsonData.note);
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          // You can set parsedJson to a default value or handle the error in a different way
          jsonData = null;
        }
        // Handle the data as needed
        // refetchStatus();
        setIsLoading(false);
      }

      if (getEquationDataError) {
        console.error(getEquationDataError);
        setIsLoading(false);
        // Handle the error as needed
      }
    }
  }, [getEquationData, getEquationDataError, getEquationisLoading]);

  const onChangeFindEquation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(value);
    setFindEquation(value);
  };

  const getEquation = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setNoteInserted(false);
    getEquationRefetch();
  };

  const _insertNoteText = (e) => {
    e.stopPropagation();
    if (noteResults) {
      insertText(noteResults);
      setNoteInserted(true);
    }
  };

  return (
    <EditBlockPopupStyle
      ref={ref}
      className="block rounded-md border border-gray-200 bg-gray-100 p-2 shadow-md"
    >
      <div className="flex">
        <form
          onSubmit={getEquation}
          className="relative flex w-full items-center"
        >
          <InfoToolTip />
          <input
            autoFocus
            onChange={onChangeFindEquation}
            className="indent-text block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500  focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Search equations, formulas, reactions..."
          />
          <div className="group flex items-center">
            <div className="absolute right-[6px] ">
              {isLoading ? (
                <div className="mr-1">
                  <LoadingSpinner />
                </div>
              ) : (
                <button
                  type="submit"
                  className="rounded-md p-1 transition duration-200 hover:bg-gray-200"
                >
                  <Send
                    color={theme.colors.darkgray}
                    width={24}
                    height={24}
                    className="text-red group-hover:text-black"
                  />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="mt-2 flex h-[130px] justify-between">
        <textarea
          value={value}
          className="w-full resize-none rounded-md border border-gray-200 bg-transparent p-2 focus:border-[#007AFF] focus:outline-none"
          onChange={onEquationChange}
          placeholder="TEX code"
        />
      </div>
      {noteResults && (
        <div className="relative mt-2">
          <textarea
            readOnly={true}
            value={noteResults}
            className="h-[130px] w-full resize-none rounded-md border border-gray-200 bg-transparent p-2  focus:border-[#007AFF] focus:outline-none"
          />
          <div className="absolute bottom-4 right-2">
            <button
              className="insert-text flex items-center rounded-md border border-[#007AFF] bg-white px-1 py-[2px]  text-sm text-[#007AFF]   shadow-sm transition duration-300 "
              disabled={noteInserted}
              onClick={_insertNoteText}
            >
              <FileText color="#007AFF" width={16} />
            </button>
          </div>
        </div>
      )}
      <div className="mt-3 flex justify-end">
        <button
          className="flex items-center rounded-md bg-[#007AFF] px-2 py-1  text-sm text-white  shadow-sm transition duration-300 hover:bg-[#006EE6] "
          onClick={onClick}
        >
          <span className="mr-1">Done</span>
          <CornerDownLeft color="white" width={16} />
        </button>
      </div>
    </EditBlockPopupStyle>
  );
});
