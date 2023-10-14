import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Element as SlateElement, Node, Transforms } from "slate";
import YouTube from "react-youtube";

import {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Form";
import { EditorContext } from "@/contexts/EditorContext";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { ReactEditor, useSelected } from "slate-react";
import { Youtube, Play } from "lucide-react";
import { OptionMenu } from "../OptionMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResizeBlock, Position } from "@/hooks/useResizeBlock";
import styled from "styled-components";
import { BlockAlign } from "@/components/BlockAlign";
import { cn } from "@/utils/cn";
import { api } from "@/utils/api";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { extractVideoID } from "@/utils/helpers";
import { YoutubeEmbedEdit } from "@/components/YoutubeEmbedEdit";
import { Settings } from "lucide-react";
import { genNodeId } from "@/hoc/withID";
import { sideBarStore } from "@/store/sidebar";

const YoutubePlayButton = styled.div`
  background: red;
  border-radius: 52% / 10%;
  color: #ffffff;
  font-size: 20px;
  height: 50px;
  margin: 20px auto;
  padding: 0;
  position: relative;
  text-align: center;
  text-indent: 0.1em;
  transition: all 150ms ease-out;
  width: 58px;
  opacity: 0.9;

  &:before {
    background: inherit;
    border-radius: 10% / 25%;
    bottom: 9%;
    content: "";
    left: -5%;
    position: absolute;
    right: -5%;
    top: 8%;
    scale: 1.03;
  }

  &:after {
    border-style: solid;
    border-width: 10px 0 10px 17.712px; /* Converted from 1em and 1.732em respectively */
    border-color: transparent transparent transparent rgb(255, 255, 255);
    content: " ";
    font-size: 12px;
    height: 0;
    margin: -10px 0 0 -10px; /* Converted from -1em and -0.75em respectively */
    top: 50%;
    position: absolute;
    width: 0;
  }
`;

const ASPECT_RATIO = 0.5625;
const DEFAULT_WIDTH = 680;
const DEFAULT_HEIGHT = 400;

export const Embed = React.memo(
  (props: { attributes: any; children: any; element: any }) => {
    const { attributes, children, element } = props;
    const {
      elementData,
      setElementData,
      setShowRightSidebar,
      setTab,
      setCurrentVideoTime,
    } = useTextSpeech();
    const selected = useSelected();
    const { setCurrentTime, currentTime }: any = sideBarStore((state) => state);

    const { editor, setActivePath, setShowEditBlockPopup } =
      useContext(EditorContext);

    const opts = {
      width: element.width,
      height: element.width * ASPECT_RATIO,
      playerVars: {
        // This is where you put parameters like playing state, start time, etc.
        autoplay: 1,
        start: element.startTime,
        // Add other playerVars here
      },
    };
    const videoPlayerRef = useRef(null);
    const intervalRef = useRef(null);
    const onReady = (event) => {
      console.log("Video Ready:", event.target);
      videoPlayerRef.current = event.target;
    };

    // const [currentVideoTime, setCurrentTime] = useState(0);

    const onStateChange = useCallback(
      (event) => {
        console.log("Player State Changed:", event.target.getPlayerState());

        const currentTime = Math.round(event.target.getCurrentTime());
        console.log("Current Time:", currentTime);

        // When video is playing
        if (event.target.getPlayerState() === 1) {
          intervalRef.current = setInterval(() => {
            const currentTime = Math.round(event.target.getCurrentTime());
            console.log("Current Time:", currentTime);
            // setCurrentTime(currentTime);
            setCurrentTime(currentTime);
          }, 1000);
        } else {
          clearInterval(intervalRef.current);
        }
      },
      [element.videoId]
    );

    useEffect(() => {
      return () => clearInterval(intervalRef.current); // Clear interval on component unmount
    }, [element.videoId]);

    const path = ReactEditor.findPath(editor, element);
    const iframeSrcRef = useRef<string>("");
    const [embedLink, setEmbedLink] = useState<string>(element.embedLink);
    const [align, setAlign] = useState(element.align || "start");

    const startTime = element.startTime || 0;
    const [showIframe, setShowIframe] = useState(false); // New state to toggle iframe

    const {
      handleMouseDown,
      setPos,
      ref: imageRef,
      blockWidth,
      blockHeight,
    } = useResizeBlock(element, editor, path);

    useEffect(() => {
      if (element.embedLink) {
        iframeSrcRef.current =
          element.embedLink + "?autoplay=1" + "&start=" + startTime;
        setCurrentTime(0);
      }
    }, [element.embedLink]);

    useEffect(() => {
      if (selected) {
        setElementData(element);
      }
    }, [selected]);

    return (
      <div
        data-id={element.id}
        data-path={JSON.stringify(path)}
        // data-current-time={currentVideoTime}
        data-videoId={element.videoId}
      >
        {!element.embedLink ? (
          <div className="flex">
            <div
              className={`hover:bg-gray-muted relative mr-2  flex grow  cursor-pointer items-center rounded-md bg-gray-100 p-2 transition dark:bg-secondary dark:hover:bg-background/70 
        hover:dark:bg-accent
        `}
              contentEditable={false}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowEditBlockPopup({
                  open: true,
                  element: "embed",
                  path: JSON.stringify(path),
                });
                setActivePath(JSON.stringify(path));
              }}
            >
              <Youtube
                width={46}
                height={46}
                className="rounded-md opacity-30 dark:bg-transparent"
              />
              <span className="ml-4 opacity-30">Embed Youtube Video</span>
              {children}
            </div>

            <div className=" right-1 top-1 z-10 mr-2 flex opacity-0 group-hover:opacity-100 ">
              <OptionMenu element={element} />
            </div>
          </div>
        ) : (
          <div
            className={` flex pr-2 justify-${align} `}
            {...attributes}
            contentEditable={false}
          >
            {!showIframe ? (
              <div
                className={cn(
                  `relative  flex w-full max-w-[660px]  items-center justify-center  rounded-md lg:max-w-[535px] xl:max-w-[680px]  ${
                    selected
                      ? "ring-2 ring-brand  ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-0 "
                      : "ring-black/40 ring-offset-white hover:ring-2 hover:ring-offset-2 dark:ring-offset-gray-300 "
                  }`
                )}
                style={{
                  width: blockWidth,
                  height: blockWidth * ASPECT_RATIO,
                  overflow: "hidden",
                }}
              >
                <img
                  src={element.thumbnail}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  width={blockWidth}
                  ref={imageRef}
                  className="rounded-md"
                  alt="alt"
                  tabIndex={-1}
                  onMouseDown={() => {
                    Transforms.select(editor, path);
                    setShowRightSidebar(true);
                    setTab("properties");
                  }}
                />

                <button
                  className="absolute top-1/2  flex -translate-y-[44px]"
                  onClick={(e) => {
                    setShowIframe(true);
                  }}
                >
                  <YoutubePlayButton />
                </button>
                <div
                  className={`absolute -right-[3px] top-0 flex h-full items-center`}
                  onMouseDown={() => {
                    handleMouseDown();
                    setPos(Position.Right);
                  }}
                >
                  <div
                    className={`  flex h-full  w-[18px] items-center opacity-0  lg:group-hover:opacity-100 xl:pointer-events-auto `}
                  >
                    <div className="mx-auto block h-[60px] w-[6px]  cursor-col-resize rounded-lg border border-white bg-[#191919] opacity-70 dark:bg-background"></div>
                  </div>
                </div>
                <div
                  className={`absolute -left-[3px] top-0 flex h-full items-center`}
                  onMouseDown={() => {
                    handleMouseDown();
                    setPos(Position.Left);
                  }}
                >
                  <div
                    className={`  flex h-full  w-[18px] items-center opacity-0  lg:group-hover:opacity-100 xl:pointer-events-auto `}
                  >
                    <div className="mx-auto block h-[60px] w-[6px]  cursor-col-resize rounded-lg border border-white bg-[#191919] opacity-70 dark:bg-background"></div>
                  </div>
                </div>

                <div className="absolute  right-1 top-1 z-10 flex gap-1">
                  <BlockAlign element={element} />
                  <div className="flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-md border border-gray-300 bg-white">
                    <OptionMenu element={element} />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`relative block`}>
                <YouTube
                  videoId={element.videoId}
                  opts={opts}
                  onReady={onReady}
                  onStateChange={onStateChange}
                  style={{
                    width: opts.width,
                    height: opts.height,
                  }}
                  className="h-[40px] overflow-hidden rounded-md bg-black dark:bg-black"
                />
                <div className="absolute right-1  top-1 z-10 ">
                  <OptionMenu element={element} />
                </div>
              </div>
            )}

            {children}
          </div>
        )}
      </div>
    );
  }
);

export const EmbedLink = () => {
  const { editor, activePath, setActivePath, setShowEditBlockPopup } =
    useContext(EditorContext);

  const getVideoDetailsMutation = api.workspace.getVideoDetails.useMutation();

  const [loading, setLoading] = useState(false);

  const embedLinkFormSchema = z.object({
    url: z
      .string()
      .nonempty({ message: "Input cannot be blank" })
      .url({ message: "Please enter a valid link" })
      .refine(
        (url) => {
          try {
            const urlObject = new URL(url);
            const hostname = urlObject.hostname;

            // Checks if the hostname includes 'youtube.com' or 'youtu.be'
            const isYouTubeUrl =
              hostname.includes("youtube.com") || hostname.includes("youtu.be");

            // Additional checks for 'youtube.com' can be placed here if needed.
            // For example, ensuring that the URL contains 'watch?v=' for standard YouTube watch URLs.

            return isYouTubeUrl;
          } catch (error) {
            // If an error is thrown when constructing the URL,
            // return false to indicate that the validation failed.
            return false;
          }
        },
        { message: "Please enter a valid YouTube link" }
      ),
  });

  async function onSubmit(values: z.infer<typeof embedLinkFormSchema>) {
    setLoading(true);
    const currentElement = Node.get(editor, JSON.parse(activePath));
    const actualLink = values.url;
    let newUrl = values.url;
    let videoDetails = "";
    try {
      const response = await getVideoDetailsMutation.mutateAsync({
        link: actualLink,
      });
      if (response) {
        console.log(response.videoDetails);
        videoDetails = JSON.stringify(response.videoDetails);
      }
    } catch (error) {
      videoDetails = values.url;
      console.error("error getting details", error);
    }

    const videoId = extractVideoID(values.url);
    newUrl = `https://www.youtube.com/embed/${videoId}`;

    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const newElement = {
      id: genNodeId(),
      ...currentElement,
      embedLink: newUrl,
      videoDetails,
      videoId,
      actualLink: actualLink,
      startTime: 0,
      thumbnail,
      align: "start",
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
    };
    Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });

    setLoading(false);
    setShowEditBlockPopup({
      open: false,
      element: null,
    });
  }

  const form = useForm<z.infer<typeof embedLinkFormSchema>>({
    resolver: zodResolver(embedLinkFormSchema),
    reValidateMode: "onChange",
  });

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="z-100 space-y-3 pb-2"
        >
          <FormField
            control={form.control}
            name="url"
            render={() => (
              <FormItem>
                {/* <FormLabel>Embed link</FormLabel> */}
                <FormControl>
                  <Input
                    autoFocus
                    placeholder="Paste the youtube link"
                    {...form.register("url")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex w-full items-center justify-center">
            <Button
              className="h-[36px] w-full border border-gray-300 disabled:opacity-70  "
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner strokeColor="stroke-gray-200 dark:stroke-brand" />
              ) : (
                "Embed Link"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
