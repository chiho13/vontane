import React, {
  useCallback,
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
import { Element as SlateElement, Descendant, Editor, Node, Path } from "slate";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { extractTextValues } from "../DocumentEditor/helpers/extractText";
import { root } from "postcss";
import { Info } from "lucide-react";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { ChevronDown, Link, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AudioManagerProvider } from "@/contexts/PreviewAudioContext";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";
import { saveAs } from "file-saver";

import { PreviewContent } from "../PreviewContent";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Portal } from "react-portal";
interface RightSideBarProps {
  setRightSideBarWidth: any;
  showRightSidebar: boolean;
  rightSideBarWidth: number;
}

interface AudioNode {
  audio_url?: string;
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

  const { audioData, setAudioData, rightBarAudioIsLoading, workspaceData } =
    useTextSpeech();
  const [viewport, setViewPort] = useState({
    width: 390,
    height: 844,
  });

  const [prevWorkspaceId, setPrevWorkspaceId] = useState(null);
  const [published, setPublished] = useState(workspaceData.workspace.published);

  const [copied, setCopied] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const [audioURL, setAudioURL] = useState<string>("");
  const rightSidebarStyle: React.CSSProperties = {
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
    if (prevWorkspaceId !== workspaceId) {
      // workspaceId has changed
      setPublished(workspaceData.workspace.published);
      setPrevWorkspaceId(workspaceId);
    }
  }, [workspaceId, prevWorkspaceId, workspaceData]);

  useEffect(() => {
    if (audioData) {
      setAudioURL(audioData.audio_url);
    }
  }, [audioData]);

  const [tab, setTab] = useLocalStorage("tab", "properties");

  const handleTabChange = (newTab) => {
    setTab(newTab); // This will also update value in localStorage
  };

  const containsTtsNode = (nodes) => {
    return nodes.some((node) => {
      // if the node itself is of type "tts"
      if (node.type === "tts") {
        return true;
      }

      // if the node has children, recursively check them
      if ("children" in node) {
        return containsTtsNode(node.children);
      }

      // if neither the node nor its children are of type "tts"
      return false;
    });
  };

  const concatAudio = async () => {
    console.log(editor.children);
    // Assuming editor.children is an array of objects
    let audioUrls: any[] = [];
    editor.children.forEach((child: Descendant) => {
      if ("children" in child && "audio_url" in child) {
        audioUrls.push(child.audio_url);
      }
    });

    // Assuming audioUrls is an array of URLs for audio files
    const blobs = await Promise.all(
      audioUrls.map(async (audioUrl) => {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        return blob;
      })
    );

    // Concatenate the blobs
    const concatenatedBlob = new Blob(blobs, { type: "audio/mpeg" }); // adjust the MIME type as needed

    // Save concatenated blob
    saveAs(concatenatedBlob, "concatenatedAudio.mp3");
  };

  const copyLink = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTooltipOpen(true);
      // Optionally, hide tooltip after a delay
      setTimeout(() => {
        setCopied(false);
        setTooltipOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const [pubLoading, setPubLoading] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [firstHover, setFirstHover] = useState(false);

  const debouncedSetHovering = useCallback(debounce(setHovering, 100), [
    setHovering,
  ]);

  const publishText = published
    ? hovering
      ? "Unpublish"
      : "Published"
    : "Publish";
  const publishWorkspaceMutation = api.workspace.publishWorkspace.useMutation();

  const publishWorkspace = async () => {
    setPubLoading(true);
    setFirstHover(true);
    setTimeout(async () => {
      try {
        const response = await publishWorkspaceMutation.mutateAsync({
          id: workspaceId,
        });
        if (response) {
          setPubLoading(false);
          setPublished(response.published);
        }
      } catch (error) {
        setPubLoading(false);
        console.error("Error publishing:", error);
      }
    }, 1000);
  };

  return (
    <AudioManagerProvider>
      {!published ? (
        <Button
          className={`text-bold absolute -right-[1px] -top-[30px] h-[28px] rounded-md px-3 text-sm  text-white hover:bg-brand/90 hover:text-white disabled:opacity-100 dark:border-t-gray-700 dark:bg-slate-100 dark:text-muted dark:hover:bg-slate-300 dark:hover:text-background ${
            published
              ? "bg-green-400 text-foreground dark:bg-green-400"
              : "bg-brand "
          }`}
          disabled={pubLoading}
          onClick={!pubLoading && publishWorkspace}
        >
          {pubLoading ? (
            <>
              <LoadingSpinner strokeColor="stroke-white dark:stroke-background" />{" "}
              <span className="ml-3">
                {!published ? "Publishing..." : "Unpublishing..."}
              </span>
            </>
          ) : (
            publishText
          )}
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className={`text-bold absolute -right-[1px] -top-[30px] flex h-[28px] rounded-md px-3 text-sm  text-white disabled:opacity-100 dark:border-t-gray-700 dark:bg-slate-100 dark:text-muted ${
                published
                  ? "bg-green-400 text-foreground hover:bg-green-400 hover:text-foreground dark:bg-green-400"
                  : "bg-brand "
              }`}
            >
              {pubLoading ? (
                <>
                  <LoadingSpinner strokeColor="stroke-white dark:stroke-background" />{" "}
                  <span className="ml-3">
                    {!published ? "Publishing..." : "Unpublishing..."}
                  </span>
                </>
              ) : (
                publishText
              )}
              <ChevronDown className="ml-1 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border border-gray-300  bg-background p-3 dark:border-gray-500 dark:bg-secondary"
          >
            <div className="flex flex-col gap-4 ">
              <DropdownMenuItem
                className="flex cursor-pointer justify-center border border-gray-300 dark:border-gray-700 hover:dark:bg-accent"
                disabled={pubLoading}
                onClick={!pubLoading && publishWorkspace}
              >
                <span className="text-foreground"> Unpublish</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className=" flex cursor-pointer justify-center bg-brand hover:dark:bg-brand/90"
                disabled={pubLoading}
                onClick={() => {
                  console.log("hi");
                }}
              >
                <span className="text-foreground"> View Site</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div
        className="m-w-full mt-2 hidden h-full grow overflow-y-auto rounded-md  border border-gray-300 bg-white  dark:border-gray-700 dark:bg-muted dark:text-lightgray lg:block"
        style={rightSidebarStyle}
      >
        <div className="flex-grow p-2 pb-3">
          {/* <h2 className="mb-4 text-xl font-semibold">Right Sidebar</h2>
        <p>Hi kirby</p> */}

          <Tabs
            defaultValue={tab}
            onValueChange={handleTabChange}
            className="z-10 flex flex-grow flex-col "
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

            <TabsContent value="properties" className="flex-grow">
              {SlateElement.isElement(rootNode) &&
                rootNode?.type == "tts" &&
                (audioData && audioData.file_name ? (
                  <>
                    <h3 className="text-bold mb-2 mt-4 text-sm   ">
                      Text to MP3
                    </h3>

                    <div className="my-2 block">
                      <AudioPlayer
                        audioURL={audioURL}
                        fileName={audioData.file_name}
                      />
                    </div>

                    <div className=" truncate  rounded-md border border-gray-300 p-2 pl-3 dark:border-gray-700">
                      {audioData.content}{" "}
                    </div>
                    {/* {audioData.transcript && (
                      <div className=" truncate  rounded-md border border-gray-300 p-2 pl-3 dark:border-gray-700">
                        {audioData.transcript?.transcript}{" "}
                      </div>
                    )} */}

                    <h3 className="text-bold mb-2 mt-4 text-sm">Share Audio</h3>
                    <div className="relative flex items-center">
                      <Link className="absolute left-3 w-4" />

                      <input
                        value={audioData.audio_url}
                        className="w-full rounded-md border   border-gray-300 bg-muted p-2  pl-[40px] focus:outline-none dark:border-gray-700"
                        readOnly={true}
                      />
                      <TooltipProvider delayDuration={300}>
                        <Tooltip
                          open={tooltipOpen}
                          onOpenChange={setTooltipOpen}
                        >
                          <TooltipTrigger className="absolute right-1 h-[32px]">
                            <Button
                              variant="outline"
                              className=" h-full  border border-gray-300 bg-muted px-2 dark:border-gray-400"
                              onClick={() => copyLink(audioData.audio_url)}
                            >
                              <Copy className="w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            className="border-black px-[5px]  dark:bg-white dark:text-muted"
                            side="top"
                            sideOffset={10}
                          >
                            <p className="text-[12px]">
                              {copied ? "Copied!" : "Copy Link"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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
              <div className="flex justify-end gap-3">
                {containsTtsNode(editor.children) && (
                  <button
                    className="mb-2 flex h-[28px] items-center justify-center rounded-md border border-muted-foreground bg-background p-1 text-xs  text-muted-foreground hover:border-gray-700 hover:bg-white hover:text-gray-700 dark:border-muted-foreground dark:bg-secondary dark:text-foreground dark:hover:bg-muted"
                    onClick={concatAudio}
                  >
                    Export as Single Audio File
                  </button>
                )}
                {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="mb-2 flex h-[28px] items-center justify-center rounded-md border border-muted-foreground bg-background p-1 text-xs  text-muted-foreground hover:border-gray-700 hover:bg-white hover:text-gray-700 dark:border-muted-foreground dark:bg-secondary dark:text-foreground dark:hover:bg-muted">
                    Device
                    <ChevronDown className="ml-1 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="border border-gray-300  bg-background dark:border-gray-500 dark:bg-secondary"
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
              </DropdownMenu> */}
              </div>
              <PreviewContent />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AudioManagerProvider>
  );
};
