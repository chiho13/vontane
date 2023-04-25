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
import { ReactEditor } from "slate-react";

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

interface TextSpeechProps {
  isSelected?: boolean;
}

export const TextSpeech: React.FC<TextSpeechProps> = ({
  isSelected = false,
}) => {
  const router = useRouter();
  const workspaceId = router.query.workspaceId;
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  // const [audioIsLoading, setAudioIsLoading] = useState<boolean>(false);
  const [transcriptionId, setTranscriptionId] = useState<string>("");

  const [ttsAudioFile, setTtsAudioFile] = useState<File>();
  const { editor } = useContext(EditorContext);

  // const url =
  //   "https://res.cloudinary.com/monkeyking/video/upload/v1682090997/synthesised-audio_12_qvb3p4.wav";
  // const fileName = "anny.wav";
  // const file = useDownloadFile(url, fileName);

  const [audioFiles, setAudioFiles] = useState<File[]>([]);

  const {
    textSpeech,
    selectedTextSpeech,
    audioIsLoading,
    setAudioIsLoading,
    generatedAudioElement,
    setGeneratedAudioElement,
  } = useTextSpeech();

  const [inputText, setInputText] = useState<string[]>(textSpeech);
  const {
    data: texttospeechdata,
    error: texttospeecherror,
    isLoading: texttospeechloading,
    refetch: texttospeechrefetch,
  } = api.texttospeech.startConversion.useQuery(
    { voice: selectedVoiceId, content: inputText },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    // if (selectedTextSpeech) {
    //   setInputText(selectedTextSpeech);
    //   console.log(selectedTextSpeech);
    // } else {
    //   setInputText(textSpeech);
    //   console.log(textSpeech);
    // }
    console.log(selectedTextSpeech);
  }, [selectedTextSpeech]);

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

  useEffect(() => {
    if (audioIsLoading && !texttospeechloading) {
      if (texttospeechdata) {
        setTranscriptionId(texttospeechdata.transcriptionId);
        console.log(texttospeechdata);
      }

      if (texttospeecherror) {
        console.error(texttospeecherror);
        // Handle the error as needed
      }
    }
  }, [texttospeechdata, texttospeecherror, texttospeechloading]);

  useEffect(() => {
    console.log(audioFiles);
  }, [audioFiles]);

  async function generateAudio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAudioIsLoading(true);
    setGeneratedAudioElement(null);
    setTranscriptionId("");

    texttospeechrefetch();
  }

  const [isDisabled, setIsDisabled] = useState<boolean>(true);

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

  return (
    <>
      <div className="relative mx-auto flex items-center lg:max-w-[980px]">
        <label className="text-bold mb-2 flex justify-end text-sm text-gray-400">
          {!isSelected
            ? "Convert workspace to audio"
            : "Convert selected text to audio"}
        </label>
      </div>
      <div className="relative mx-auto flex items-center lg:max-w-[980px]">
        <div className="mr-4">
          <VoiceDropdown setSelectedVoiceId={setSelectedVoiceId} />
        </div>
        <GenerateButton
          isDisabled={isDisabled}
          audioIsLoading={audioIsLoading}
          onClick={generateAudio}
        />
      </div>
    </>
  );
};
