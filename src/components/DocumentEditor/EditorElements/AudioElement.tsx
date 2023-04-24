import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Transforms } from "slate";
import styled from "styled-components";
import AudioPlayer from "@/components/AudioPlayer";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { api } from "@/utils/api";

export function AudioElement(props) {
  const { editor } = useContext(EditorContext);
  const { attributes, children, element } = props;
  const path = ReactEditor.findPath(editor, element);

  const dummyAudioElement = useMemo(() => {
    return new Audio(
      "https://peregrine-samples.s3.amazonaws.com/editor-samples/anny.wav"
    );
  }, []); // Empty dependency array means it will only be created once

  const { generatedAudioElement, setGeneratedAudioElement } = useTextSpeech();
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const {
    data: ttsaudiodata,
    error: ttsaudiodataerror,
    isLoading: ttsaudiodataloading,
    refetch: ttsaudiodatarefetch,
  } = api.texttospeech.getTextToSpeechFileName.useQuery(
    { fileName: element.fileName },
    {
      enabled: false,
      cacheTime: 5 * 60 * 1000, // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    }
  );
  useEffect(() => {
    if (element.fileName) {
      ttsaudiodatarefetch();
    }
  }, [element.fileName]);

  useEffect(() => {
    if (ttsaudiodata) {
      const audioElement = new Audio(ttsaudiodata.signedURL);
      setGeneratedAudioElement(audioElement);
      setAudioURL(ttsaudiodata.signedURL);
      setFileName(ttsaudiodata.fileName);
    }
  }, [ttsaudiodata]);

  return (
    <div
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className="mr-4"
      contentEditable={false}
    >
      {/* <p
          className="text-[18px]"

          data-placeholder={shouldShowPlaceholder ? "Enter question" : ""}
        >
          {children}
        </p> */}
      <AudioPlayer
        key={element.id}
        generatedAudio={generatedAudioElement}
        audioURL={audioURL}
        fileName={fileName}
      />
    </div>
  );
}
