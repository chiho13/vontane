import {
  forwardRef,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/utils/api";
import VoiceDropdown from "@/components/VoiceDropdown";
import GenerateButton from "@/components/GenerateButton";
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
import { Crown, Info } from "lucide-react";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserContext } from "@/contexts/UserContext";
import { Button } from "../ui/button";
import { text } from "stream/consumers";

const useDownloadFile = (url, fileName) => {
  const [file, setFile] = useState<any>(null);

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

  const [audioChecked, setAudioChecked] = useState(element.audioplayer);
  const containsMCQ = element.children.some((child) => child.type === "mcq");
  const {
    audioData,
    setAudioData,
    rightBarAudioIsLoading,
    setRightBarAudioIsLoading,
    setShowRightSidebar,
    generatedAudio,
    isPlaying,
    setTab,
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

  const { credits, setCredits }: any = useContext(UserContext);

  const TextSpeechLength = textSpeech.length > 1000;
  const createTTSAudio = async () => {
    setAudioIsLoading(true);
    // if (element.audio_url) {
    //   try {
    //     const response = await deleteTTS.mutateAsync({
    //       fileName: element.file_name,
    //       workspaceId,
    //     });
    //     if (response) {
    //       console.log(response);
    //       setAudioData({
    //         audio_url: "",
    //         file_name: "",
    //         content: "",
    //         transcript: "",
    //       });

    //       Transforms.setNodes(
    //         editor,
    //         { audio_url: "", file_name: "" }, // New properties
    //         { at: path } // Location
    //       );
    //     }
    //   } catch (error) {
    //     console.error("Error:", error);
    //   }
    // }
    try {
      const response = await startTTS.mutateAsync({
        voice_id: selectedVoiceId,
        accent: element.accent,
        content: textSpeech,
        workspaceId,
      });
      if (response) {
        setCredits(response.credits);
        console.log(response);
        setAudioIsLoading(true);
        let newLoadingState = { ...rightBarAudioIsLoading };
        newLoadingState[element.id] = false;
        setRightBarAudioIsLoading(newLoadingState);

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

        // let childPath = [...path, 0];
        // Transforms.setNodes(
        //   editor,
        //   {
        //     audio_url: response.url,
        //     content: textSpeech,
        //     transcript: response.transcript,
        //   },
        //   { at: childPath }
        // );
      }
    } catch (error) {
      console.error("Error:", error);
      setAudioIsLoading(false);
      let newLoadingState = { ...rightBarAudioIsLoading };
      newLoadingState[element.id] = false;
      setRightBarAudioIsLoading(newLoadingState);
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

  const notEnoughCredits = credits < 10 || textSpeech.length > credits;
  async function generateAudio(event) {
    event.preventDefault();
    event.stopPropagation();

    if (notEnoughCredits) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, upgrade: "true" },
      });

      return;
    }

    let newLoadingState = { ...rightBarAudioIsLoading };
    newLoadingState[element.id] = true;
    setRightBarAudioIsLoading(newLoadingState);
    setShowRightSidebar(true);
    setTab("properties");
    createTTSAudio();
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

  const showAudioPlayer = (value) => {
    setAudioChecked(value);

    Transforms.setNodes(
      editor,
      {
        audioplayer: value,
      }, // New properties
      { at: path } // Location
    );
  };

  const [genOpen, setGenOpen] = useState(false);

  const onGenOpen = (value) => {
    setGenOpen(value);
  };
  return (
    <div className="flex w-[95%] justify-between gap-2">
      <div className="relative flex items-center lg:max-w-[980px]">
        <div className="mr-2">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <VoiceDropdown
                  setSelectedVoiceId={setSelectedVoiceId}
                  selectedVoiceId={selectedVoiceId}
                  element={element}
                />
              </TooltipTrigger>

              <TooltipContent side="top" sideOffset={10}>
                <p className="text-[12px]">Choose Voice</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {selected && (
          <TooltipProvider delayDuration={300}>
            <Tooltip
              open={notEnoughCredits && genOpen}
              onOpenChange={onGenOpen}
            >
              <TooltipTrigger>
                <GenerateButton onClick={generateAudio} element={element} />
              </TooltipTrigger>

              <TooltipContent
                side="top"
                sideOffset={10}
                className="dark:bg-white dark:text-black"
              >
                <p className="text-[12px]">Not Enough Credits</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {!containsMCQ &&
        selected &&
        element.file_name &&
        textSpeech.length > 40 && (
          <div className="flex grow items-center">
            <div className="flex items-center space-x-2 ">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-2 ">
                      <Switch
                        id="audio-player"
                        checked={audioChecked}
                        onCheckedChange={showAudioPlayer}
                      />
                      <Label htmlFor="airplane-mode" className="text-xs">
                        Audio only
                      </Label>
                    </div>
                  </TooltipTrigger>

                  <TooltipContent
                    className="border-black  dark:bg-white dark:text-muted"
                    side="top"
                    sideOffset={10}
                  >
                    <p className="text-[12px]">Show Only Audio Player</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

      {selected && element.content && audioData.content !== element.content && (
        <button
          className="mr-2 flex h-[34px] rounded bg-yellow-300 p-2 text-sm text-orange-900 shadow-md disabled:opacity-50"
          onClick={generateAudio}
          disabled={rightBarAudioIsLoading[element.id]}
        >
          Content Changed. Regenerate Audio
        </button>
      )}
      {/* {audioURL && <AudioPLayer audioURL={audioURL} fileName={fileName} />} */}
    </div>
  );
};
