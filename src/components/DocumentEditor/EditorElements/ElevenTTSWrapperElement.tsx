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

const findAllSimilarElements = (nodes) => {
  let similarElements = [];
  let currentGroupIndex = 0;
  let previousNode = null;

  nodes.forEach((node, index) => {
    if (previousNode && node.type !== previousNode.type) {
      currentGroupIndex++; // Increment group index when a non-similar node is encountered
    }
    similarElements.push({
      ...node,
      groupIndex: currentGroupIndex,
      isFirstInGroup: !previousNode || node.type !== previousNode.type,
    });
    previousNode = node;
  });

  return similarElements;
};

const withConsecutiveGrouping = (Component) => {
  return (props) => {
    const { element } = props;
    const { editor } = useContext(EditorContext);

    if (!editor) {
      return <Component {...props} />;
    }

    // Find all elements within the editor
    const similarElements = findAllSimilarElements(editor.children);

    // Determine if element is the first in its group
    const isFirstInGroup =
      similarElements.find((el) => el.id === element.id)?.isFirstInGroup ||
      false;

    return <Component {...props} isFirstInGroup={isFirstInGroup} />;
  };
};

export const ElevenTTSWrapper = withConsecutiveGrouping((props) => {
  const { attributes, children, element, isFirstInGroup } = props;
  const { editor } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    element.voice_id
  );
  const selected = useSelected();
  const focused = useFocused();
  const { audioData, setAudioData } = useTextSpeech();

  useEffect(() => {
    const extractedText = extractTextValues(element.children).join(" ");

    // setTextSpeech(extractedText);
    Transforms.setNodes(
      editor,
      { content: extractedText }, // New properties
      { at: path } // Location
    );
    console.log(element.file_name);
  }, []);

  useEffect(() => {
    if (
      selected &&
      focused &&
      element.type == "tts" &&
      element?.audio_url !== audioData?.audio_url
    ) {
      setAudioData({
        audio_url: element.audio_url,
        file_name: element.file_name,
        content: element.content,
      });
    } else if (element.type !== "tts") {
      setAudioData(null);
    }
  }, [selected, focused, audioData]);
  return (
    <div
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className={` relative  ${
        isFirstInGroup ? "border-t" : ""
      } border-b border-muted-foreground bg-slate-200 p-1 pb-3 pl-0 dark:border-muted-foreground ${
        selected ? "dark:bg-brand/20" : "dark:bg-background"
      }`}
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
    </div>
  );
});
