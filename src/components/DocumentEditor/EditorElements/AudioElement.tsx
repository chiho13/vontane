import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Path, Transforms } from "slate";
import styled from "styled-components";
import AudioPlayer from "@/components/AudioPlayer";

export function AudioElement(props) {
  const { editor } = useContext(EditorContext);
  const { attributes, children, element } = props;
  const path = ReactEditor.findPath(editor, element);

  const dummyAudioElement = useMemo(() => {
    return new Audio(
      "https://peregrine-samples.s3.amazonaws.com/editor-samples/anny.wav"
    );
  }, []); // Empty dependency array means it will only be created once

  return (
    <div
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className="mt-2 mr-4"
    >
      {/* <p
          className="text-[18px]"
          data-placeholder={shouldShowPlaceholder ? "Enter question" : ""}
        >
          {children}
        </p> */}
      <AudioPlayer generatedAudio={dummyAudioElement} />
    </div>
  );
}
