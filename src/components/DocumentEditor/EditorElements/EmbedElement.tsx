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
import { Youtube } from "lucide-react";
import { OptionMenu } from "../OptionMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Embed = React.memo(
  (props: { attributes: any; children: any; element: any }) => {
    const { attributes, children, element } = props;
    const { setElementData } = useTextSpeech();
    const selected = useSelected();

    const { editor, setActivePath, setShowEditBlockPopup } =
      useContext(EditorContext);

    const path = ReactEditor.findPath(editor, element);
    const [embedLink, setEmbedLink] = useState(element.embedLink);

    return (
      <div data-id={element.id} data-path={JSON.stringify(path)}>
        {!element.embedLink ? (
          <div
            tabIndex={-1}
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
          <div>lol</div>
        )}
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

  async function onSubmit(values: z.infer<typeof embedLinkFormSchema>) {
    const currentElement = Node.get(editor, JSON.parse(activePath));

    let newUrl = values.url;
    try {
      // Attempt to fetch the image to see if it is valid.
      const response = await fetch(values.url, { method: "HEAD" });
      if (!response.ok) {
        throw new Error("Invalid image URL");
      }
    } catch (error) {
      // If fetching the image fails, use a fallback URL.
      newUrl = "/images/imagenotfound.png";
    }

    const newElement = {
      ...currentElement,
      embedLink: newUrl,
      align: "start",
      width: 700,
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
              variant="outline"
              className="h-[36px] border border-gray-300 bg-white dark:text-background dark:hover:bg-foreground/90"
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
