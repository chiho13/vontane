import { useContext, useEffect, useState, useRef, memo } from "react";
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
import { CgMergeHorizontal } from "react-icons/cg";
import { VscUngroupByRefType } from "react-icons/vsc";
import { useLocalStorage } from "usehooks-ts";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/utils/api";
import { useRouter } from "next/router";

const findAllSimilarElements = (nodes) => {
  let similarElements = [];
  let currentGroupIndex = 0;
  let previousNode = null;

  nodes.forEach((node, index) => {
    if (previousNode && node.type !== previousNode.type) {
      currentGroupIndex++;
    }
    similarElements.push({
      ...node,
      groupIndex: currentGroupIndex,
      isFirstInGroup: !previousNode || node.type !== previousNode.type,
    });
    previousNode = node;
  });

  // Set isLastInGroup
  for (let i = 0; i < similarElements.length; i++) {
    if (
      i === similarElements.length - 1 ||
      similarElements[i].type !== similarElements[i + 1].type
    ) {
      similarElements[i].isLastInGroup = true;
    } else {
      similarElements[i].isLastInGroup = false;
    }
  }

  return similarElements;
};

const withConsecutiveGrouping = (Component) => {
  return (props) => {
    const { element } = props;
    const { editor } = useContext(EditorContext);

    if (!editor) {
      return <Component {...props} />;
    }

    const similarElements = findAllSimilarElements(editor.children);
    const elementInfo = similarElements.find((el) => el.id === element.id);
    const isFirstInGroup = elementInfo?.isFirstInGroup || false;
    const isLastInGroup = elementInfo?.isLastInGroup || false;

    const currentIndex = similarElements.findIndex(
      (el) => el.id === element.id
    );
    const nextElement = similarElements[currentIndex + 1];

    return (
      <Component
        {...props}
        isFirstInGroup={isFirstInGroup}
        isNotLastInGroup={!isLastInGroup}
        nextElement={!isLastInGroup ? nextElement : null}
      />
    );
  };
};

export const ElevenTTSWrapper = withConsecutiveGrouping((props) => {
  const {
    attributes,
    children,
    element,
    isFirstInGroup,
    isNotLastInGroup,
    nextElement,
  } = props;
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

  const [groupedElements, setGroupedElements] = useState({});

  useEffect(() => {
    const extractedText = extractTextValues(element.children).join(" ");
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
        loading: false,
      });
    } else if (element.type !== "tts" && audioData !== null) {
      setAudioData(null);
    }
  }, [activePath, element.children]);

  const groupElements = () => {
    // const groupOfCurrentElement = groupedElements[element.id] || [];
    // const groupOfNextElement = groupedElements[nextElement.id] || [];
    // const newGroup = [
    //   ...groupOfCurrentElement,
    //   element.id,
    //   ...groupOfNextElement,
    //   nextElement.id,
    // ];
    // const newGroupedElements = { ...groupedElements };
    // newGroup.forEach((id) => {
    //   newGroupedElements[id] = newGroup;
    // });

    // setGroupedElements(newGroupedElements);

    // // Traverse through the newGroup and apply `setNodes` on each one
    // newGroup.forEach((id) => {

    // });
    Transforms.setNodes(editor, { grouped: true }, { at: path });
    Transforms.setNodes(editor, { grouped: true }, { at: Path.next(path) });
    console.log("merged with", nextElement.id);
  };

  return (
    <div
      {...attributes}
      data-id={element.id}
      data-path={JSON.stringify(path)}
      className={` relative  ${
        isFirstInGroup ? "border-t" : ""
      } border-b border-muted-foreground p-1 pb-3 pl-0 dark:border-muted-foreground ${
        selected
          ? " bg-brand/30 dark:bg-brand/20"
          : "bg-slate-200 dark:bg-background"
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
      {selected && <MoveBlock editor={editor} path={path} />}
      {/* {isNotLastInGroup && nextElement.file_name && (
        <div className="absolute -bottom-[10px]  right-2 z-20  ">
          {element.grouped ? (
            <button
              className="flex  h-[20px] w-[26px] cursor-pointer items-center justify-center rounded-md border border-foreground bg-background p-px p-1 text-xs text-foreground hover:border-gray-700 hover:bg-white hover:text-gray-700 disabled:border-gray-400 dark:border-muted-foreground dark:bg-secondary dark:text-foreground dark:hover:bg-muted"
              onClick={groupElements}
            >
              <CgMergeHorizontal className="h-4 w-4" />
            </button>
          ) : (
            <button
              className="flex  h-[20px] w-[26px] cursor-pointer items-center justify-center rounded-md border border-foreground bg-background p-px p-1 text-xs text-foreground hover:border-gray-700 hover:bg-white hover:text-gray-700 disabled:border-gray-400 dark:border-muted-foreground dark:bg-secondary dark:text-foreground dark:hover:bg-muted"
              onClick={groupElements}
            >
              <VscUngroupByRefType className="h-4 w-4" />
            </button>
          )}
        </div>
      )} */}
      {selected && (
        <div className="absolute -bottom-[14px] left-0 right-0 z-10 text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="mx-auto  flex h-[28px] w-[28px] items-center justify-center rounded-md border border-foreground bg-background p-1 text-xs text-foreground hover:border-gray-700 hover:bg-white hover:text-gray-700 dark:border-muted-foreground dark:bg-secondary dark:text-foreground dark:hover:bg-muted">
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
});
