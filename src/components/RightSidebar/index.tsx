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
import { jsx } from "slate-hyperscript";
import ReactDOMServer from "react-dom/server";

import {
  Element as SlateElement,
  Descendant,
  Editor,
  Node,
  Path,
  Text,
  Transforms,
  Range,
} from "slate";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { extractTextValues } from "../DocumentEditor/helpers/extractText";
import { root } from "postcss";
import { Check, Info, ListEnd } from "lucide-react";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { ChevronDown, Link, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AudioManagerProvider } from "@/contexts/PreviewAudioContext";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";
import { saveAs } from "file-saver";

import { PreviewContent } from "../PreviewContent";
import { PublishButton } from "../PublishButton";
import { useClipboard } from "@/hooks/useClipboard";
import { MapSettings } from "../MapSettings";
import { deserialize } from "@/hoc/withPasting";

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
import { Label } from "../ui/label";
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

  const translationMutation = api.gpt.translate.useMutation();

  const { editor, activePath, setLastActiveSelection } =
    useContext(EditorContext);
  const rootNode = useMemo(() => {
    let path = activePath ? JSON.parse(activePath) : [];
    while (path && path.length > 1) {
      path = Path.parent(path);
    }
    return path.length ? Node.get(editor, path) : null;
  }, [editor, activePath]);

  console.log(rootNode);

  const {
    audioData,
    setAudioData,
    elementData,
    rightBarAudioIsLoading,
    workspaceData,
    refetchWorkspaceData,
    tab,
    setTab,
  } = useTextSpeech();
  const [viewport, setViewPort] = useState({
    width: 390,
    height: 844,
  });

  const [published, setPublished] = useState(workspaceData.workspace.published);

  const { copied, copyToClipboard: copyLink } = useClipboard();
  const { copied: translatedCopy, copyToClipboard: copytranslatedCopy } =
    useClipboard();

  const [audioURL, setAudioURL] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const rightSidebarStyle: React.CSSProperties = {
    transform: `translateX(${
      showRightSidebar ? "0px" : `${rightSideBarWidth}px`
    })`,
    height: "calc(100vh - 150px)",
    minWidth: "390px",
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
    setPublished(workspaceData.workspace.published);
  }, [workspaceData, router.isReady]);

  useEffect(() => {
    if (audioData) {
      setAudioURL(audioData.audio_url);
    }
  }, [audioData]);

  const handleTabChange = (newTab) => {
    setTab(newTab); // This will also update value in localStorage
  };

  const containsTtsNode = (nodes) => {
    return nodes.some((node) => {
      // if the node itself is of type "tts"
      if (node.type === "tts" && "url" in node) {
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

  const [pubLoading, setPubLoading] = useState(false);
  const publishWorkspaceMutation = api.workspace.publishWorkspace.useMutation();

  const publishWorkspace = async () => {
    setPubLoading(true);

    try {
      const response = await publishWorkspaceMutation.mutateAsync({
        id: workspaceId,
      });
      if (response) {
        setPubLoading(false);
        setPublished(response.published);
        refetchWorkspaceData();
        setOpenDropdown(true);
      }
    } catch (error) {
      setPubLoading(false);
      console.error("Error publishing:", error);
    }
  };

  const languages = [
    "English",
    "Spanish",
    "French",
    "Hindi",
    "Italian",
    "German",
    "Polish",
    "Portuguese",
  ];
  const [selectedLanguage, setSelectedLanguage] = useLocalStorage(
    "languageSelect",
    languages[1]
  );

  const [translateLoading, setTranslateLoading] = useState(false);

  const [translateText, setTranslatedText] = useState("");
  const [translatedTextHTML, setTranslateTextHTML] = useState("");

  const startTranslate = async () => {
    setTranslateLoading(true);

    try {
      const response = await translationMutation.mutateAsync({
        language: selectedLanguage,
        prompt: promptValue,
      });
      if (response) {
        setTranslateLoading(false);
        setTranslateTextHTML(response);
        const text = getHtmlAsText(response);
        setTranslatedText(text);
      }
    } catch (error) {
      setTranslateLoading(false);
      console.error("Error translating:", error);
    }
  };

  const slateNodeToHtml = (node) => {
    if (SlateElement.isElement(node)) {
      const children = node.children.map((n) => slateNodeToHtml(n)).join("");

      switch (node.type) {
        case "paragraph":
          return `<p>${children}</p>`;
        case "heading-one":
          return `<h1>${children}</h1>`;
        // ...more cases for your other block types...
        default:
          return children;
      }
    } else {
      return node.text;
    }
  };

  const getHtmlFromSelection = () => {
    if (!editor.selection) return "";

    // Get the fragment (block of text) from the current selection
    const fragment = Editor.fragment(editor, editor.selection);

    // Convert each node in the fragment to HTML
    const html = fragment.map((node) => slateNodeToHtml(node)).join("");

    return html;
  };

  const getHtmlAsText = (html) => {
    // Use DOMParser to convert the HTML string to a document
    const doc = new DOMParser().parseFromString(html, "text/html");

    // Extract the text content of each paragraph, join them with line breaks
    const text = Array.from(doc.querySelectorAll("p"))
      .map((p) => p.textContent)
      .join("\n");

    return text;
  };

  function convertLineBreaksToParagraphs(text) {
    // Split the text into lines
    const lines = text.split("\n");

    // Wrap each line in a <p> tag and join them together
    const html = lines.map((line) => `<p>${line}</p>`).join("");

    return html;
  }

  function pasteHtml(html, editor) {
    // Parse the HTML.
    const parsed = new DOMParser().parseFromString(html, "text/html");

    // Deserialize the parsed HTML to a Slate fragment.
    const fragment = deserialize(parsed.body);

    // Insert the fragment into the editor.
    Transforms.insertFragment(editor, fragment);
  }

  const replaceSelectedText = () => {
    if (!editor.selection) return;
    pasteHtml(translatedTextHTML, editor);
  };

  const insertTranslatedTextBelow = () => {
    if (!editor.selection) return;

    // Parse the HTML.
    const parsed = new DOMParser().parseFromString(
      translatedTextHTML,
      "text/html"
    );

    // Deserialize the parsed HTML to a Slate fragment.
    const fragment = deserialize(parsed.body);

    // Collapse the selection to the end.
    const selectionEnd = Range.isExpanded(editor.selection)
      ? Range.end(editor.selection)
      : editor.selection.anchor;
    Transforms.collapse(editor, { edge: "end" });

    // Try to move the selection to the next block.
    try {
      const nextPath = Path.next(selectionEnd.path);
      Transforms.select(editor, nextPath);
    } catch (error) {
      // If moving to the next block fails, the selection stays at the end of the current block.
    }

    // Insert the fragment at the selection.
    Transforms.insertNodes(editor, fragment);
  };

  const [inputValue, setInputValue] = useState("");
  const [promptValue, setPromptValue] = useState("");

  // Append selected text to input value when editor.selection changes
  useEffect(() => {
    if (editor.selection) {
      const html = getHtmlFromSelection();
      const text = getHtmlAsText(html);
      setInputValue(text);
      setPromptValue(html);
    }
  }, [editor.selection]);

  const onInputChange = (event) => {
    const convertToHTML = convertLineBreaksToParagraphs(event.target.value);

    console.log(convertToHTML);
    setInputValue(event.target.value);
    setPromptValue(convertToHTML);
  };

  const renderText = () => {
    if (!editor.selection) return null;
    const text = getHtmlFromSelection();

    return (
      <div className="mt-10">
        <Label>Translate Text:</Label>
        <textarea
          value={inputValue}
          className=" mt-2 h-[120px] w-full resize-none rounded-md border border-gray-300 bg-transparent p-2 outline-none ring-muted-foreground focus:ring-1 dark:border-accent"
          onChange={onInputChange}
        />

        <div className="mt-2 flex gap-3">
          <div className="relative inline-block text-left">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="border" variant="outline" size="sm">
                  {selectedLanguage}
                  <ChevronDown className="w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="border bg-muted dark:border-gray-500"
              >
                {languages.map((language, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="text-foreground"
                    onClick={() => setSelectedLanguage(language)}
                  >
                    {language}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {text.length > 0 && (
            <Button
              className="text-sm"
              size="sm"
              onClick={startTranslate}
              disabled={translateLoading}
            >
              {translateLoading ? (
                <LoadingSpinner strokeColor="stroke-gray-200 dark:stroke-muted" />
              ) : (
                "Translate"
              )}
            </Button>
          )}
        </div>

        {translateText && (
          <div>
            <div className="relative">
              <textarea
                className="relative mt-3 h-[140px] w-full resize-none rounded-md  border border-accent bg-transparent p-2 outline-none ring-muted-foreground focus:ring-1"
                value={translateText}
                onChange={(e) => {
                  setTranslatedText(e.target.value);
                  const convertToHTML = convertLineBreaksToParagraphs(
                    e.target.value
                  );

                  setTranslateTextHTML(convertToHTML);
                }}
              />
              <Button
                variant="outline"
                className="absolute bottom-4 right-2 border text-xs text-muted-foreground "
                size="xs"
                onClick={() => copytranslatedCopy(translateText)}
              >
                <Copy className="mr-2 w-4 " />
                {translatedCopy ? "Copied!" : "Copy"}
              </Button>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                className="border text-muted-foreground"
                size="xs"
                onClick={replaceSelectedText}
              >
                <Check className="mr-2 w-5 " /> Replace Selection
              </Button>
              <Button
                variant="outline"
                className="border text-muted-foreground"
                size="xs"
                onClick={insertTranslatedTextBelow}
              >
                <ListEnd className="mr-2 w-5 " /> Insert below
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AudioManagerProvider>
      <PublishButton
        published={published}
        pubLoading={pubLoading}
        publishWorkspace={publishWorkspace}
        editor={editor}
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
      />
      <div
        className="m-w-full sticky top-[30px] mt-2 hidden h-full grow overflow-y-auto rounded-md  border border-gray-300 bg-white  dark:border-accent dark:bg-muted dark:text-lightgray lg:block"
        style={rightSidebarStyle}
      >
        <div className="flex-grow p-2 pb-3">
          <Tabs
            value={tab}
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
                rootNode?.type == "map" &&
                elementData && (
                  <MapSettings
                    element={elementData}
                    path={JSON.parse(activePath)}
                  />
                )}
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
                        content={rootNode.content}
                        fileName={audioData.file_name}
                      />
                    </div>

                    <div className=" truncate  rounded-md border border-gray-300 p-2 pl-3 dark:border-accent">
                      {audioData.content}{" "}
                    </div>
                    {/* {audioData.transcript && (
                      <div className=" truncate  rounded-md border border-gray-300 p-2 pl-3 dark:border-accent">
                        {audioData.transcript?.transcript}{" "}
                      </div>
                    )} */}

                    <h3 className="text-bold mb-2 mt-4 text-sm">Share Audio</h3>
                    <div className="relative flex items-center">
                      <Link className="absolute left-3 w-4 dark:stroke-gray-300 " />

                      <input
                        value={audioData.audio_url}
                        className=" h-[36px]  w-full rounded-md  rounded-r-none border  border-r-0 border-gray-300 bg-muted  p-2  pl-[40px] text-sm focus:outline-none  focus-visible:outline-none dark:border-accent dark:border-gray-400 dark:text-gray-400"
                        readOnly={true}
                      />
                      <Button
                        variant="outline"
                        className=" h-[36px] rounded-l-none border border-gray-300 bg-muted px-2 text-center dark:border-gray-400"
                        onClick={() => copyLink(audioData.audio_url)}
                      >
                        <p className="flex truncate text-xs ">
                          {copied ? "Copied!" : "Copy Link"}
                        </p>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="relative block rounded-lg border border-gray-300 bg-white p-4 dark:border-accent dark:bg-secondary">
                    No Audio generated
                  </div>
                ))}
              <div>{renderText()}</div>
              {/* {SlateElement.isElement(rootNode) &&
                rootNode?.type == "tts" &&
                audioData && (
                  <textarea
                    className="mt-3 h-[180px] w-full resize-none rounded-md border border-accent bg-transparent p-2 outline-none ring-muted-foreground focus:ring-1"
                    value={
                      audioData.paragraphs && audioData.paragraphs.join("\n")
                    }
                    readOnly
                  />
                )} */}
            </TabsContent>
            <TabsContent value="preview">
              <div className="flex justify-end gap-3">
                {containsTtsNode(editor.children) && (
                  <button
                    className="mb-2 flex h-[28px] items-center justify-center rounded-md border border-muted-foreground bg-background p-1 text-xs  text-muted-foreground hover:border-accent hover:bg-white hover:text-gray-700 dark:border-muted-foreground dark:bg-secondary dark:text-foreground dark:hover:bg-muted"
                    onClick={concatAudio}
                  >
                    Export as Single Audio File
                  </button>
                )}
              </div>
              <PreviewContent />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AudioManagerProvider>
  );
};
