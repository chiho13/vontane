import { forwardRef, useContext, useEffect, useState } from "react";
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
import { Info } from "lucide-react";
import LoadingSpinner from "@/icons/LoadingSpinner";
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
    setShowRightSidebar,
    generatedAudio,
    isPlaying,
  } = useTextSpeech();

  const [textSpeech, setTextSpeech] = useState(audioData.content || "");
  const [audioIsLoading, setAudioIsLoading] = useState(false);
  // const [audioURL, setAudioURL] = useState(element.audio_url || "");
  const [fileName, setFileName] = useState("");

  const startTTS = api.texttospeech.startConversion.useMutation();
  const deleteTTS = api.texttospeech.deleteAudio.useMutation();
  const selected = useSelected();
  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

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
        content: textSpeech,
        workspaceId,
      });
      if (response) {
        console.log(response);
        setAudioIsLoading(false);
        setRightBarAudioIsLoading((prev) => ({ ...prev, [element.id]: false }));
        setAudioData({
          audio_url: response.url,
          file_name: response.fileName,
          content: textSpeech,
        });
        // setFileName(response.fileName);

        Transforms.setNodes(
          editor,
          {
            loading: false,
            audio_url: response.url,
            file_name: response.fileName,
            content: textSpeech,
          }, // New properties
          { at: path } // Location
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setAudioIsLoading(false);
      setRightBarAudioIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      selectedVoiceId &&
      textSpeech &&
      !(Array.isArray(textSpeech) && textSpeech.length === 0)
    ) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [selectedVoiceId, textSpeech]);

  async function generateAudio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    setAudioIsLoading(true);
    setRightBarAudioIsLoading((prev) => ({ ...prev, [element.id]: true }));
    setShowRightSidebar(true);
    createTTSAudio();
    console.log("lol", path);
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
    <div className="flex w-[95%] justify-between">
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
      <div
        className="flex grow items-center"
        onMouseDown={(e) => {
          // Prevent default action
          e.preventDefault();

          ReactEditor.focus(editor);
          Transforms.select(editor, Editor.start(editor, path));
        }}
      ></div>

      {selected && audioData.content !== element.content && (
        <div className="mr-2 flex h-[34px] rounded bg-yellow-300 p-2 text-sm text-orange-900 shadow-md">
          Content Changed. Regenerate Audio
        </div>
      )}
      {/* {audioURL && <AudioPLayer audioURL={audioURL} fileName={fileName} />} */}
    </div>
  );
};
