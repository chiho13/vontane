import { useContext, useEffect, useState, useRef, memo } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { TextSpeech } from "@/components/TextSpeech";
import { OptionMenu } from "../OptionMenu";
import { extractTextValues } from "../helpers/extractText";
import styled from "styled-components";
import {
  TextSpeechProvider,
  useTextSpeech,
} from "@/contexts/TextSpeechContext";
import { Editor, Transforms } from "slate";

const ElevenWrapperStyle = styled.div`
  &.border-corner {
    position: relative;
  }

  &.border-corner::before,
  &.border-corner::after {
    content: "";
    position: absolute;
    border: solid 2px;
  }

  &.border-corner::before {
    border-top: none;
    border-right: none;
    width: 30px;
    height: 30px;
    bottom: -2px;
    left: 20px;
  }

  &.border-corner::after {
    border-bottom: none;
    border-left: none;
    width: 30px;
    height: 30px;
    top: 0px;
    right: 0;
  }
`;

export const ElevenTTSWrapper = (props) => {
  const { attributes, children, element } = props;
  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    element.voice_id
  );
  const selected = useSelected();
  const { setTextSpeech } = useTextSpeech();

  useEffect(() => {
    const extractedText = extractTextValues(element.children).join(" ");

    setTextSpeech(extractedText);
    Transforms.setNodes(
      editor,
      { content: extractedText }, // New properties
      { at: path } // Location
    );
  }, [element.children]);

  return (
    <ElevenWrapperStyle
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className=" relative mt-5  mb-5 border-t border-b border-muted-foreground bg-slate-200 p-1 pb-3 pl-0 dark:border-muted-foreground dark:bg-background"
    >
      <div className="ml-[49px] mb-5 mt-4" contentEditable={false}>
        <TextSpeech
          selectedVoiceId={selectedVoiceId}
          setSelectedVoiceId={setSelectedVoiceId}
          element={element}
        />
      </div>
      {children}
      <div className="absolute top-[5px] right-[10px] z-10">
        <OptionMenu element={element} />
      </div>
    </ElevenWrapperStyle>
  );
};
