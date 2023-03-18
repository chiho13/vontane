import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { getTextSpeechStatusPolling } from "../api/ttsStatusPolling";

import { api } from "@/utils/api";
import { io } from "socket.io-client";

type UseTextSpeechStatusPollingResult = [
  HTMLAudioElement | null,
  Dispatch<SetStateAction<HTMLAudioElement | null>>
];

function useTextSpeechStatusPolling(
  setAudioIsLoading: (value: boolean) => void
): UseTextSpeechStatusPollingResult {
  const [generatedAudioElement, setGeneratedAudioElement] =
    useState<HTMLAudioElement | null>(null);

  const SOCKET_URL = process.env.PLAYHT_SOCKET_URL;

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("gettexttospeechstatus", (data) => {
      if (data.status === "SUCCESS") {
        console.log("Received audio URL:", data.metadata.output[0]);

        const newAudioElement = new Audio(data.metadata.output[0]);
        console.log(data.metadata.progress);
        newAudioElement.addEventListener("error", (e) => {
          console.error("Error playing audio:", e);
        });
        // newAudioElement.play();
        setGeneratedAudioElement(newAudioElement);
        setAudioIsLoading(false);
      }

      if (data.status === "QUEUED") {
        console.log("progress:", data.metadata.progress);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return [generatedAudioElement, setGeneratedAudioElement];
}

export default useTextSpeechStatusPolling;
