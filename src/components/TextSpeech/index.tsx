import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import VoiceDropdown from "@/components/VoiceDropdown";
import GenerateButton from "@/components/GenerateButton";
import useStatusPolling from "@/hooks/useStatusPolling";
import AudioPlayer from "@/components/AudioPlayer";
import { Portal } from "react-portal";

type TextSpeechProps = {
  enteredText: string[];
  //   setEnteredText: (enteredText: string[]) => void;
};

export const TextSpeech: React.FC<TextSpeechProps> = ({
  enteredText,
  //   setEnteredText,
}) => {
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [audioIsLoading, setAudioIsLoading] = useState<boolean>(false);
  const [transcriptionId, setTranscriptionId] = useState<string>("");
  const [generatedAudioElement, setGeneratedAudioElement] =
    useStatusPolling(setAudioIsLoading);

  const {
    data: texttospeechdata,
    error: texttospeecherror,
    isLoading: texttospeechloading,
    refetch: texttospeechrefetch,
  } = api.texttospeech.startConversion.useQuery(
    { voice: selectedVoiceId, content: enteredText },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (
      selectedVoiceId &&
      enteredText &&
      !(Array.isArray(enteredText) && enteredText.length === 0)
    ) {
      console.log(enteredText);
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [selectedVoiceId, enteredText]);

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
  }, [
    audioIsLoading,
    texttospeechdata,
    texttospeecherror,
    texttospeechloading,
  ]);

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
      enteredText &&
      !(Array.isArray(enteredText) && enteredText.length === 0)
    ) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [selectedVoiceId, enteredText]);

  return (
    <>
      <div className="relative mx-auto flex items-center justify-center lg:w-[980px]">
        <div className="mr-4 flex-1 ">
          <VoiceDropdown setSelectedVoiceId={setSelectedVoiceId} />
        </div>

        <GenerateButton
          isDisabled={isDisabled}
          audioIsLoading={audioIsLoading}
          onClick={generateAudio}
        />
      </div>
      {!audioIsLoading && generatedAudioElement && (
        <Portal>
          <div className="fixed bottom-0 left-0 bottom-4 right-0 mx-auto flex w-full justify-center ">
            <div className="w-[94%] flex-shrink-0 lg:w-[500px] ">
              <AudioPlayer
                generatedAudio={generatedAudioElement}
                transcriptionId={transcriptionId}
              />
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};
