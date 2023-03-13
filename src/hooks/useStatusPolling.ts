import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { getTextSpeechStatusPolling } from "../api/ttsStatusPolling";

function useTextSpeechStatusPolling(
  transcriptionId: string,
  status: string,
  setStatus: (value: boolean) => void,
  setAudioIsLoading: (value: boolean) => void
): (
  | HTMLAudioElement
  | Dispatch<SetStateAction<HTMLAudioElement | null>>
  | null
)[] {
  const [generatedAudioElement, setGeneratedAudioElement] =
    useState<HTMLAudioElement | null>(null);

  const intervalRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start polling for status updates
    intervalRef.current = setInterval(async () => {
      if (transcriptionId.length) {
        try {
          const data = await getTextSpeechStatusPolling(transcriptionId);

          setStatus(data.transcriped);
          console.log(data);

          if (status && data.audioUrl && data.audioUrl.length > 0) {
            const newAudioElement = new Audio(data.audioUrl[0]);
            newAudioElement.addEventListener("error", (e) => {
              console.error("Error playing audio:", e);
            });
            // newAudioElement.play();
            setGeneratedAudioElement(newAudioElement);
            setAudioIsLoading(false);
          }

          // Clear the interval when transcription is complete
          if (data.transcriped) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
          }
        } catch (error) {
          console.error("Error fetching transcription status:", error);
          // TODO: Handle error (e.g. show error message to user)
        }
      }
    }, 1000);

    // Stop polling when the component unmounts or the transcriptionId or status changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [transcriptionId, status]);

  return [generatedAudioElement, setGeneratedAudioElement];
}

export default useTextSpeechStatusPolling;
