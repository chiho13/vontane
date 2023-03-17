import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { getTextSpeechStatusPolling } from "../api/ttsStatusPolling";

import { api } from "@/utils/api";

type UseTextSpeechStatusPollingResult = [
  HTMLAudioElement | null,
  Dispatch<SetStateAction<HTMLAudioElement | null>>,
  () => void
];

function useTextSpeechStatusPolling(
  transcriptionId: string,
  setAudioIsLoading: (value: boolean) => void
): UseTextSpeechStatusPollingResult {
  const [generatedAudioElement, setGeneratedAudioElement] =
    useState<HTMLAudioElement | null>(null);

  const intervalRef = useRef<NodeJS.Timer | null>(null);

  const {
    data: ttsStatusData,
    error: ttsStatusError,
    isLoading: ttsStatusLoading,
    refetch: ttsStatusRefetch,
  } = api.texttospeech.getSpeechStatus.useQuery(
    { transcriptionId: transcriptionId },
    {
      enabled: !!transcriptionId, // Enable the query if transcriptionId is provided
    }
  );

  const refetchStatus = (): void => {
    ttsStatusRefetch();
  };

  useEffect(() => {
    if (transcriptionId && !ttsStatusData?.transcriped) {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          ttsStatusRefetch();
        }, 1000); // Refetch every 1 second
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    if (!ttsStatusLoading) {
      if (ttsStatusData) {
        console.log(ttsStatusData);
        if (ttsStatusData.transcriped) {
          const newAudioElement = new Audio(ttsStatusData.audioUrl[0]);
          newAudioElement.addEventListener("error", (e) => {
            console.error("Error playing audio:", e);
          });
          // newAudioElement.play();
          setGeneratedAudioElement(newAudioElement);
          setAudioIsLoading(false);
          console.log("Speech transcription completed");
        }
      }

      if (ttsStatusError) {
        console.error(ttsStatusError);
        // Handle the error as needed
      }
    }
  }, [transcriptionId, ttsStatusData, ttsStatusError, ttsStatusLoading]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return [generatedAudioElement, setGeneratedAudioElement, refetchStatus];
}

export default useTextSpeechStatusPolling;
