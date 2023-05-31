import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "styled-components";
import { TextSpeech } from "../TextSpeech";
import { useLocalStorage } from "usehooks-ts";
import AudioPlayer from "../AudioPlayer";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { EditorContext } from "@/contexts/EditorContext";
import { Editor, Node, Path } from "slate";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { extractTextValues } from "../DocumentEditor/helpers/extractText";
import { root } from "postcss";
import { Info } from "lucide-react";
interface RightSideBarProps {
  showRightSidebar: boolean;
  rightSideBarWidth: number;
}

export const RightSideBar: React.FC<RightSideBarProps> = ({
  showRightSidebar,
  rightSideBarWidth,
}) => {
  const theme = useTheme();
  const { editor, activePath } = useContext(EditorContext);
  const rootNode = useMemo(() => {
    let path = activePath ? JSON.parse(activePath) : [];
    while (path && path.length > 1) {
      path = Path.parent(path);
    }
    return path.length ? Node.get(editor, path) : null;
  }, [editor, activePath]);

  const extractedText = extractTextValues(rootNode?.children).join(" ");
  console.log(extractedText);

  const [rootContent, setRootContent] = useState(extractedText);
  const [isLoading, setIsLoading] = useState(true);
  const [contentChanged, setContentChanged] = useState(false);

  const { audioData, setAudioData, rightBarAudioIsLoading } = useTextSpeech();
  const prevAudioData = useRef(audioData);
  useEffect(() => {
    let path = activePath ? JSON.parse(activePath) : [];
    while (path && path.length > 1) {
      path = Path.parent(path);
    }
    const newRootNode = path.length ? Node.get(editor, path) : null;
    if (newRootNode && prevAudioData.current !== audioData) {
      setContentChanged(
        (prevContentChanged) =>
          prevContentChanged !== (newRootNode.content !== audioData.content)
      );
    }
    prevAudioData.current = audioData;
  }, [editor, activePath, audioData]);

  useEffect(() => {
    console.log(rootNode?.content);
  }, [rootNode]);
  const rightSidebarStyle = {
    transform: `translateX(${
      showRightSidebar ? "0px" : `${rightSideBarWidth}px`
    })`,
    height: "calc(100vh - 120px)",
    minWidth: "340px",
    maxWidth: "570px",
    flexBasis: `${rightSideBarWidth}px`,
    opacity: showRightSidebar ? "1" : "0",
    pointerEvents: showRightSidebar ? "auto" : "none",
    transition:
      "width 0.3s ease-in-out, opacity 0.4s ease-in-out, transform 0.3s ease-in-out",
  };

  const [tab, setTab] = useLocalStorage("tab", "properties");

  const handleTabChange = (newTab) => {
    setTab(newTab); // This will also update value in localStorage
  };

  return (
    <div
      className="m-w-full bg-w mt-2 hidden grow rounded-md border border-gray-300 bg-white px-1 dark:border-gray-700 dark:bg-muted dark:text-lightgray lg:block"
      style={rightSidebarStyle}
    >
      <div className="p-2">
        {/* <h2 className="mb-4 text-xl font-semibold">Right Sidebar</h2>
        <p>Hi kirby</p> */}
        <Tabs defaultValue={tab} onValueChange={handleTabChange}>
          <TabsList
            className={`ring-gray ring-red grid h-10 w-full grid-cols-2  bg-lightgray dark:bg-accent`}
          >
            <TabsTrigger
              value="properties"
              className={` data-[state=active]:bg-brand  data-[state=active]:text-white dark:text-muted-foreground dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background `}
            >
              Tools
            </TabsTrigger>

            <TabsTrigger
              value="preview"
              className={` data-[state=active]:bg-brand  data-[state=active]:text-white dark:text-muted-foreground dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background `}
              disabled={true}
            >
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            {rootNode?.type == "tts" &&
              (audioData && audioData.audio_url ? (
                <>
                  <h3 className="mt-4 mb-2 text-sm ">Text to MP3</h3>
                  <AudioPlayer
                    audioURL={audioData.audio_url}
                    fileName={audioData.file_name}
                    content={audioData.content}
                  />
                </>
              ) : (
                <div className="relative block rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-secondary">
                  {rightBarAudioIsLoading ? (
                    <div className="flex items-center ">
                      <LoadingSpinner />
                      <span className="ml-3 ">Generating...</span>
                    </div>
                  ) : (
                    "No Audio generated"
                  )}
                </div>
              ))}

            {contentChanged ? (
              <div className="mt-3 flex items-center text-sm  text-amber-600 dark:text-amber-400">
                <Info className="mr-2 " /> Content has changed. Re-generate
                audio
              </div>
            ) : (
              ""
            )}
          </TabsContent>
          <TabsContent value="slide">Doc or Slide Preview</TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
