import { useContext, useEffect, useState } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { TextSpeech } from "@/components/TextSpeech";
import { OptionMenu } from "../OptionMenu";
import { extractTextValues } from "../helpers/extractText";
import styled from "styled-components";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { Editor, Path, Transforms } from "slate";
import { Plus } from "lucide-react";
import { RxLetterCaseCapitalize } from "react-icons/rx";
import { MoveBlock } from "@/components/MoveBlock";
import { insertNewParagraph } from "../helpers/toggleBlock";
import { TextIcon } from "@/icons/Text";
import { BsSoundwave } from "react-icons/bs";
import { addTTSBlock } from "../helpers/addTTSBlock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

const findAllSimilarElements = (nodes: any) => {
  let similarElements: any[] = [];
  let currentGroupIndex = 0;
  let previousNode: { type: any } | null = null;

  nodes.forEach((node: { type: any } | null, index: any) => {
    if (previousNode && node && node.type !== previousNode.type) {
      currentGroupIndex++; // Increment group index when a non-similar node is encountered
    }
    similarElements.push({
      ...node,
      groupIndex: currentGroupIndex,
      isFirstInGroup:
        !previousNode || (node && node.type !== previousNode.type),
    });
    previousNode = node;
  });

  return similarElements;
};

const withConsecutiveGrouping = (Component: any) => {
  return (props: any) => {
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

const ElevenTTSWrapperBase = (props: {
  attributes: any;
  children: any;
  element: any;
  isFirstInGroup: any;
}) => {
  const { attributes, children, element, isFirstInGroup } = props;
  const { editor, activePath } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(
    element.voice_id
  );
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;
  const selected = useSelected();
  const focused = useFocused();
  const { audioData, setAudioData } = useTextSpeech();

  useEffect(() => {
    const extractedText = extractTextValues(element.children).join(" ");

    console.log(extractedText);
    if (
      activePath &&
      JSON.parse(activePath)[0] === path[0] &&
      (element?.audio_url !== audioData?.audio_url ||
        audioData?.content !== extractedText)
    ) {
      console.log(extractedText);
      setAudioData({
        audio_url: element.audio_url,
        file_name: element.file_name,
        content: extractedText,
        transcript: element.transcript,
      });
    } else if (element.type !== "tts" && audioData !== null) {
      setAudioData({
        audio_url: "",
        file_name: "",
        content: "",
        transcript: "",
      });
    }
  }, [activePath, element]);

  return (
    <div
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className={` relative  ${
        isFirstInGroup ? "border-t" : ""
      } border-b border-muted-foreground p-1 pb-3 pl-0 dark:border-muted-foreground ${
        selected ? " bg-brand/20 dark:bg-brand/20" : "bg-white dark:bg-muted"
      }`}
    >
      <div className="mb-5 ml-[49px] mt-4" contentEditable={false}>
        <TextSpeech
          selectedVoiceId={selectedVoiceId}
          setSelectedVoiceId={setSelectedVoiceId}
          element={element}
        />
      </div>
      {children}
      <div className="absolute right-[10px] top-[5px] z-10">
        <OptionMenu element={element} />
      </div>
      {selected && <MoveBlock editor={editor} path={path} />}
      {selected && (
        <div className="absolute -bottom-[14px] z-10 flex w-full justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex  h-[28px] w-[28px] items-center justify-center rounded-md border-2 border-foreground bg-background p-1 text-xs text-foreground hover:border-gray-700 hover:bg-white hover:text-gray-700 dark:border-muted-foreground dark:bg-secondary dark:text-foreground dark:hover:bg-muted">
                <Plus width={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="border-2 border-gray-300  bg-background dark:border-accent dark:bg-secondary"
            >
              <DropdownMenuItem
                onClick={() => {
                  const { newPath: addedPath, id } = addTTSBlock(editor, path);
                  Transforms.select(editor, Editor.start(editor, addedPath));
                  ReactEditor.focus(editor);
                }}
                className="dark:text-foreground hover:dark:bg-muted"
              >
                <BsSoundwave className="mr-2 h-[22px] w-[22px]" />
                <span className="text-foreground">Text to MP3</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  insertNewParagraph(editor, Path.next(path));
                  Transforms.select(
                    editor,
                    Editor.start(editor, Path.next(path))
                  );
                  ReactEditor.focus(editor);
                }}
                className="group hover:dark:bg-muted"
              >
                <div className="mr-2 block">
                  <RxLetterCaseCapitalize className="mr-2 h-[22px] w-[22px]" />
                </div>
                <span className="text-foreground"> Text Block</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
ElevenTTSWrapperBase.displayName = "ElevenTTSWrapper";

export const ElevenTTSWrapper = withConsecutiveGrouping(ElevenTTSWrapperBase);
