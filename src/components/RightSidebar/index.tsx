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
import { api } from "@/utils/api";
import { useRouter } from "next/router";

import { PreviewContent } from "../PreviewContent";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface RightSideBarProps {
  setRightSideBarWidth: any;
  showRightSidebar: boolean;
  rightSideBarWidth: number;
}

export const RightSideBar: React.FC<RightSideBarProps> = ({
  setRightSideBarWidth,
  showRightSidebar,
  rightSideBarWidth,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;

  const { editor, activePath } = useContext(EditorContext);
  const rootNode = useMemo(() => {
    let path = activePath ? JSON.parse(activePath) : [];
    while (path && path.length > 1) {
      path = Path.parent(path);
    }
    return path.length ? Node.get(editor, path) : null;
  }, [editor, activePath]);

  const { audioData, setAudioData, rightBarAudioIsLoading } = useTextSpeech();
  const [viewport, setViewPort] = useState({
    width: 390,
    height: 844,
  });

  const [audioURL, setAudioURL] = useState();
  const rightSidebarStyle = {
    transform: `translateX(${
      showRightSidebar ? "0px" : `${rightSideBarWidth}px`
    })`,
    height: "calc(100vh - 120px)",
    minWidth: "415px",
    maxWidth: "570px",
    flexBasis: `${rightSideBarWidth}px`,
    opacity: showRightSidebar ? "1" : "0",
    flexGrow: 0,
    flexShrink: 0,
    pointerEvents: showRightSidebar ? "auto" : "none",
    transition:
      "width 0.3s ease-in-out, opacity 0.4s ease-in-out, transform 0.3s ease-in-out",
  };

  useEffect(() => {
    if (audioData) {
      setAudioURL(audioData.audio_url);
    }
  }, [audioData]);

  // const {
  //   data: ttsaudiodata,
  //   error: ttsaudiodataerror,
  //   isLoading: ttsaudiodataloading,
  //   refetch: ttsaudiodatarefetch,
  // } = api.texttospeech.getTextToSpeechFileName.useQuery(
  //   { fileName: audioData.file_name, workspaceId },
  //   {
  //     enabled: false,
  //     cacheTime: 5 * 60 * 1000, // Cache data for 5 minutes
  //     staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
  //   }
  // );
  // useEffect(() => {
  //   if (audioData.file_name) {
  //     ttsaudiodatarefetch();
  //   }
  // }, [audioData.file_name]);

  // useEffect(() => {
  //   if (ttsaudiodata) {
  //     setAudioURL(ttsaudiodata.signedURL);
  //   }
  // }, [ttsaudiodata]);

  const [tab, setTab] = useLocalStorage("tab", "properties");

  const handleTabChange = (newTab) => {
    setTab(newTab); // This will also update value in localStorage
  };

  return (
    <div
      className="m-w-full bg-w relative mt-2 hidden grow overflow-y-auto rounded-md border border-gray-300 bg-white px-1 dark:border-gray-700 dark:bg-muted dark:text-lightgray lg:block"
      style={rightSidebarStyle}
    >
      <div className="flex-grow p-2 pb-3">
        {/* <h2 className="mb-4 text-xl font-semibold">Right Sidebar</h2>
        <p>Hi kirby</p> */}
        <Tabs
          defaultValue={tab}
          onValueChange={handleTabChange}
          className="flex flex-grow flex-col"
        >
          <TabsList
            className={`ring-gray ring-red  grid h-10 w-full grid-cols-2  bg-lightgray dark:bg-accent`}
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
            >
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="flex-grow overflow-y-auto">
            {rootNode?.type == "tts" &&
              (audioData && audioData.file_name ? (
                <>
                  <h3 className="mt-4 mb-2 text-sm ">Text to MP3</h3>

                  <AudioPlayer
                    audioURL={audioURL}
                    fileName={audioData.file_name}
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
          </TabsContent>
          <TabsContent value="preview">
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="mb-2 flex h-[28px] items-center justify-center rounded-md border border-muted-foreground bg-background p-1 text-xs  text-muted-foreground hover:border-gray-700 hover:bg-white hover:text-gray-700 dark:border-muted-foreground dark:bg-secondary dark:text-foreground dark:hover:bg-muted">
                    Device
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="border-2 border-gray-300  bg-background dark:border-accent dark:bg-secondary"
                >
                  <DropdownMenuItem
                    className="dark:text-foreground hover:dark:bg-muted"
                    onClick={() => {
                      setRightSideBarWidth(418);
                      setViewPort({
                        width: 390,
                        height: 692,
                      });
                    }}
                  >
                    <span className="text-foreground">iPhone 14</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:dark:bg-muted"
                    onClick={() => {
                      setRightSideBarWidth(456);
                      setViewPort({
                        width: 428,
                        height: 759,
                      });
                    }}
                  >
                    <span className="text-foreground"> iPhone 14 Pro Max</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <PreviewContent viewport={viewport} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
