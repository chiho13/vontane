import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Element as SlateElement, Node, Transforms } from "slate";

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
import { useResizeBlock } from "@/hooks/useResizeBlock";
import styled from "styled-components";

const YoutubePlayButton = styled.div`
  background: red;
  border-radius: 50% / 10%;
  color: #ffffff;
  font-size: 2em; /* change this to change size */
  height: 48px;
  margin: 20px auto;
  padding: 0;
  position: relative;
  text-align: center;
  text-indent: 0.1em;
  transition: all 150ms ease-out;
  width: 58px;

  &:before {
    background: inherit;
    border-radius: 10% / 25%;
    bottom: 9%;
    content: "";
    left: -5%;
    position: absolute;
    right: -5%;
    top: 9%;
    scale: 1.03;
  }

  &:after {
    border-style: solid;
    border-width: 10px 0 10px 17.712px; /* Converted from 1em and 1.732em respectively */
    border-color: transparent transparent transparent rgba(255, 255, 255, 0.9);
    content: " ";
    font-size: 12px;
    height: 0;
    margin: -10px 0 0 -10px; /* Converted from -1em and -0.75em respectively */
    top: 50%;
    position: absolute;
    width: 0;
  }
`;

export const Embed = React.memo(
  (props: { attributes: any; children: any; element: any }) => {
    const { attributes, children, element } = props;
    const { setElementData } = useTextSpeech();
    const selected = useSelected();

    const { editor, setActivePath, setShowEditBlockPopup } =
      useContext(EditorContext);

    const path = ReactEditor.findPath(editor, element);
    const iframeSrcRef = useRef<string>("");
    const [embedLink, setEmbedLink] = useState<string>(element.embedLink);
    const [align, setAlign] = useState(element.align || "start");

    const [showIframe, setShowIframe] = useState(false); // New state to toggle iframe

    const {
      handleMouseDown,
      setPos,
      ref: imageRef,
      blockWidth,
    } = useResizeBlock(element, editor, path);

    useEffect(() => {
      if (element.embedLink) {
        iframeSrcRef.current = element.embedLink + "?autoplay=1";
      }
    }, [element.embedLink]);

    return (
      <div data-id={element.id} data-path={JSON.stringify(path)}>
        {!element.embedLink ? (
          <div
            className={`hover:bg-gray-muted relative  mr-2 flex  cursor-pointer items-center rounded-md bg-gray-100 p-2 transition dark:bg-secondary dark:hover:bg-background/70 
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
            <div className="absolute  right-1 top-1 z-10 flex opacity-0 group-hover:opacity-100 ">
              <OptionMenu element={element} />
            </div>
          </div>
        ) : (
          <div
            className={` flex pr-2 justify-${align} `}
            {...attributes}
            contentEditable={false}
          >
            {/* {element.thumbnail} */}

            {!showIframe ? (
              <div
                className={`flex items-center justify-center ${
                  selected &&
                  "rounded-md ring-2 ring-brand ring-offset-2 ring-offset-white "
                }`}
                style={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "56.25%" /* 100% / (16/9) */,
                  overflow: "hidden",
                }}
              >
                <img
                  src={element.thumbnail}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: element.width,
                    height: "100%",
                    objectFit: "cover",
                  }}
                  className={`rounded-md`}
                  alt="alt"
                  tabIndex={-1}
                  onMouseDown={() => {
                    Transforms.select(editor, path);
                  }}
                />
                <button
                  className="absolute top-1/2  flex -translate-y-[44px]"
                  onClick={() => setShowIframe(true)}
                >
                  <YoutubePlayButton />
                </button>
              </div>
            ) : (
              <iframe
                width={element.width}
                height={element.height}
                src={iframeSrcRef.current}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full rounded-md bg-black"
              />
            )}

            {children}
          </div>
        )}
        <div className="absolute  right-3 top-1 z-10 flex ">
          <OptionMenu element={element} />
        </div>
      </div>
    );
  }
);

export const EmbedLink = () => {
  const { editor, activePath, setActivePath, setShowEditBlockPopup } =
    useContext(EditorContext);
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

  const extractVideoID = (url: string) => {
    const videoIDRegex =
      /(?:www\.youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(videoIDRegex);
    return matches ? matches[1] : "";
  };

  async function onSubmit(values: z.infer<typeof embedLinkFormSchema>) {
    const currentElement = Node.get(editor, JSON.parse(activePath));

    let newUrl = values.url;

    const videoId = extractVideoID(values.url);
    newUrl = `https://www.youtube.com/embed/${videoId}`;

    const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    const newElement = {
      ...currentElement,
      embedLink: newUrl,
      thumbnail,
      align: "start",
      width: 680,
      height: 400,
    };
    Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });

    setShowEditBlockPopup({
      open: false,
      element: null,
    });

    setActivePath("");
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
              className="h-[36px] w-full border border-gray-300  "
              type="submit"
            >
              Embed Link
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
