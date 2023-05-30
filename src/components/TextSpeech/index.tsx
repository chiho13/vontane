import { useContext, useEffect, useState } from "react";
import { api } from "@/utils/api";
import VoiceDropdown from "@/components/VoiceDropdown";
import GenerateButton from "@/components/GenerateButton";
import useStatusPolling from "@/hooks/useTextSpeechAPI";
import AudioPlayer from "@/components/AudioPlayer";
import { Portal } from "react-portal";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { genNodeId } from "@/hoc/withID";
import { useRouter } from "next/router";
import { Mirt } from "@/plugins/audioTrimmer";
import { Transforms, Editor, Node } from "slate";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useSelected } from "slate-react";
import AudioPLayer from "@/components/AudioPlayer";
import { extractTextValues } from "../DocumentEditor/helpers/extractText";

const useDownloadFile = (url, fileName) => {
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (url && fileName) {
        const response = await fetch(url);
        const data = await response.blob();
        const file = new File([data], fileName, { type: data.type });
        setFile(file);
      } else {
        setFile(null);
      }
    };

    fetchFile();
  }, [url, fileName]);

  return file;
};

export const TextSpeech = ({
  selectedVoiceId,
  setSelectedVoiceId,
  element,
}) => {
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;
  // const [audioIsLoading, setAudioIsLoading] = useState<boolean>(false);
  const [transcriptionId, setTranscriptionId] = useState<string>("");

  const {
    audioData,
    setAudioData,
    rightBarAudioIsLoading,
    setRightBarAudioIsLoading,
  } = useTextSpeech();

  const [textSpeech, setTextSpeech] = useState(element.content || "");
  const [audioIsLoading, setAudioIsLoading] = useState(false);
  // const [audioURL, setAudioURL] = useState(element.audio_url || "");
  const [fileName, setFileName] = useState("");
  const [inputText, setInputText] = useState<string | null>(textSpeech);

  const startTTS = api.texttospeech.startConversion.useMutation();
  const deleteTTS = api.texttospeech.deleteAudio.useMutation();
  const selected = useSelected();
  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  console.log(workspaceId);
  const createTTSAudio = async () => {
    if (element.audio_url) {
      try {
        const response = await deleteTTS.mutateAsync({
          fileName: element.file_name,
          workspaceId,
        });
        if (response) {
          console.log(response);
          setAudioData({
            audio_url: "",
            file_name: "",
            content: "",
          });
          // setFileName(response.fileName);

          Transforms.setNodes(
            editor,
            { audio_url: "", file_name: "" }, // New properties
            { at: path } // Location
          );
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
    try {
      const response = await startTTS.mutateAsync({
        voice_id: selectedVoiceId,
        content: inputText,
        workspaceId,
      });
      if (response) {
        console.log(response);
        setAudioIsLoading(false);
        setRightBarAudioIsLoading(false);
        setAudioData({
          audio_url: response.url,
          file_name: response.fileName,
          content: inputText,
        });
        // setFileName(response.fileName);

        Transforms.setNodes(
          editor,
          { audio_url: response.url, file_name: response.fileName }, // New properties
          { at: path } // Location
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (
      selectedVoiceId &&
      textSpeech &&
      !(Array.isArray(textSpeech) && textSpeech.length === 0)
    ) {
      console.log(textSpeech);
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [selectedVoiceId, textSpeech]);

  async function generateAudio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    setAudioIsLoading(true);
    setRightBarAudioIsLoading(true);
    createTTSAudio();
    // console.log("lol", path);
    console.log(textSpeech);
  }

  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (
      selectedVoiceId &&
      // textSpeech &&
      !(Array.isArray(textSpeech) && textSpeech.length === 0)
    ) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [selectedVoiceId, textSpeech]);

  return (
    <>
      <div className="relative mt-4 flex items-center lg:max-w-[980px]"></div>
      <div className="relative flex items-center lg:max-w-[980px]">
        <div className="mr-2">
          <VoiceDropdown
            setSelectedVoiceId={setSelectedVoiceId}
            selectedVoiceId={selectedVoiceId}
            element={element}
          />
        </div>

        {selected && (
          <GenerateButton
            audioIsLoading={audioIsLoading}
            onClick={rightBarAudioIsLoading ? undefined : generateAudio}
            element={element}
          />
        )}
      </div>
      {/* {audioURL && <AudioPLayer audioURL={audioURL} fileName={fileName} />} */}
    </>
  );
};
