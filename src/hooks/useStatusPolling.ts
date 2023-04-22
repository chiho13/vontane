import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { getTextSpeechStatusPolling } from "../api/ttsStatusPolling";
import { genNodeId } from "@/hoc/withID";
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

  const [audioURL, setAudioURL] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const SOCKET_URL = process.env.PLAYHT_SOCKET_URL;

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("gettexttospeechstatus", (data) => {
      if (data.status === "SUCCESS") {
        console.log("Received audio URL:", data.metadata.output);

        const newAudioElement = new Audio(data.metadata.output[0]);
        setAudioURL(data.metadata.output[0]);
        setFileName(`synthesis-${genNodeId()}.wav`);
        console.log(data.metadata.progress);
      }

      if (data.status === "QUEUED") {
        console.log("progress:", data.metadata.progress);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const {
    data: uploadAudioData,
    error: uploadAudioError,
    isLoading: uploadAudioLoading,
    refetch: uploadAudioRefetch,
  } = api.texttospeech.uploadAudio.useQuery(
    { audioURL, fileName },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (audioURL) {
      uploadAudioRefetch();
    }
  }, [audioURL]);

  useEffect(() => {
    if (uploadAudioData) {
      console.log(uploadAudioData);
      const newAudioElement = new Audio(uploadAudioData.url);
      setGeneratedAudioElement(newAudioElement);
      setAudioIsLoading(false);
    }

    if (uploadAudioError) {
      console.error(uploadAudioError);
      // Handle the error as needed
    }
  }, [uploadAudioData, uploadAudioError, uploadAudioLoading]);

  return [generatedAudioElement, setGeneratedAudioElement];
}

export default useTextSpeechStatusPolling;
