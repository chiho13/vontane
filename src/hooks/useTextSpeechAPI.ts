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
  setAudioIsLoading: (value: boolean) => void,
  workspaceId: any,
  ttsaudiodatarefetch: () => void
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

  const uploadAudioToSupabase = api.texttospeech.uploadAudio.useMutation();

  const createTTSAudio = async () => {
    try {
      const response = await uploadAudioToSupabase.mutateAsync({
        audioURL,
        fileName,
        workspaceId,
      });
      if (response && response.tts) {
        ttsaudiodatarefetch();
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  useEffect(() => {
    if (audioURL) {
      createTTSAudio();
    }
  }, [audioURL]);

  return [generatedAudioElement, setGeneratedAudioElement];
}

export default useTextSpeechStatusPolling;
