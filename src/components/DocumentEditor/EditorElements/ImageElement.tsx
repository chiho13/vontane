import {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import Image from "next/image";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor, useFocused, useSelected } from "slate-react";
import { Editor, Transforms } from "slate";
import { OptionMenu } from "../OptionMenu";
import { Image as ImageIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Node } from "slate";
import { Send } from "lucide-react";
import LoadingSpinner from "@/icons/LoadingSpinner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Form";

import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/utils/api";

export const ImageElement = React.memo((props) => {
  const { attributes, children, element } = props;
  const {
    editor,
    showEditBlockPopup,
    selectedElementID,
    activePath,
    setActivePath,
    setShowEditBlockPopup,
    setSelectedElementID,
  } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  const [isResizing, setIsResizing] = useState(false);
  const [imageWidth, setWidth] = useState(element.width); // default width

  const selected = useSelected();

  const handleMouseDown = useCallback((e) => {
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(
    (e) => {
      setIsResizing(false);
      const newElement = { ...element, width: imageWidth };

      Transforms.setNodes(editor, newElement, { at: path });
    },
    [imageWidth]
  );

  useEffect(() => {}, [selected]);

  const handleMouseMove = useCallback(
    (e) => {
      if (isResizing) {
        // Update the width here
        const newWidth = e.clientX - ref.current.getBoundingClientRect().left;
        if (newWidth < 250) {
          // If it is, set the width to the minimum width
          setWidth(250);
        } else {
          // Otherwise, use the new width
          setWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div data-id={element.id} data-path={JSON.stringify(path)}>
      {element.url?.trim() === "" ? (
        <>
          <div
            tabIndex={-1}
            className={`hover:bg-gray-muted relative flex  cursor-pointer items-center rounded-md bg-gray-100 p-2 transition dark:bg-secondary hover:dark:bg-accent 
      dark:hover:bg-background/70
      `}
            contentEditable={false}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowEditBlockPopup({
                open: true,
                element: "image",
              });
              setActivePath(JSON.stringify(path));
              setSelectedElementID(element.id);
            }}
          >
            <div className="flex items-center">
              <ImageIcon
                width={46}
                height={46}
                className="rounded-md opacity-30 dark:bg-transparent"
              />
              <span className="ml-4 opacity-30">Add an Image</span>
            </div>

            {children}
          </div>
          <div className="absolute top-0 right-2 z-10 ">
            <OptionMenu element={element} />
          </div>
        </>
      ) : (
        <div
          tabIndex={-1}
          className="group flex"
          contentEditable={false}
          style={{
            width: "calc(100% - 10px)",
          }}
        >
          <div className="relative bg-gray-200 dark:bg-background">
            <img src={element.url} width={imageWidth} ref={ref} />
            <div
              className="absolute top-0 -right-[3px] flex  h-full items-center"
              onMouseDown={handleMouseDown}
            >
              <div
                className={`  flex h-full  w-[18px] items-center opacity-0 transition duration-300 lg:group-hover:opacity-100 xl:pointer-events-auto `}
              >
                <div className="mx-auto block h-[60px] w-[6px]  cursor-col-resize rounded-lg border border-foreground bg-[#b4b4b4] dark:bg-background"></div>
              </div>
            </div>
            <div className="absolute top-0 right-2 z-10 ">
              <OptionMenu element={element} />
            </div>
          </div>
          {children}
        </div>
      )}
    </div>
  );
});

export const ImageEmbedLink = () => {
  const formSchema = z.object({
    url: z
      .string()
      .nonempty({ message: "Input cannot be blank" })
      .url({ message: "Please enter a valid link" })
      .refine(
        (url) => {
          try {
            const imageExtensions = [
              "jpg",
              "jpeg",
              "png",
              "gif",
              "bmp",
              "tiff",
              "svg",
              "webp",
            ];

            const urlObject = new URL(url);
            const pathname = urlObject.pathname;
            const extension = pathname.split(".").pop();

            const isUnsplashUrl = urlObject.hostname.includes("unsplash.com");

            return imageExtensions.includes(extension) || isUnsplashUrl;
          } catch (error) {
            // If an error is thrown when constructing the URL,
            // return false to indicate that the validation failed.
            return false;
          }
        },
        { message: "Please enter a valid image link" }
      ),
  });

  const {
    editor,
    activePath,
    setActivePath,
    showEditBlockPopup,
    setShowEditBlockPopup,
  } = useContext(EditorContext);

  const aiImageFormSchema = z.object({
    prompt: z.string().nonempty("Please enter a description"),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
  });

  const aiImageForm = useForm<z.infer<typeof aiImageFormSchema>>({
    resolver: zodResolver(aiImageFormSchema),
    reValidateMode: "onChange",
  });

  const [imagePrompt, setImagePrompt] = useState("");
  const [url, setURL] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [aiImageResults, setAIImageResults] = useState<Array<{ url: any }>>([]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

    const newElement = { ...currentElement, url: newUrl };
    Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });

    setShowEditBlockPopup({
      open: false,
      element: null,
    });

    setActivePath("");
  }

  // useEffect(() => {
  //   form.setFocus("url");
  // }, []);

  const [tab, setTab] = useLocalStorage("imagetab", "link");

  const handleTabChange = (newTab) => {
    setTab(newTab); // This will also update value in localStorage
  };

  const genImage = api.gpt.createimage.useMutation();

  async function createImage(values: z.infer<typeof aiImageFormSchema>) {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await genImage.mutateAsync({
        prompt: values.prompt,
      });
      if (response && response.data) {
        console.log(response.data);
        setAIImageResults(response.data.map((item) => ({ url: item.url })));
        setIsGenerating(false);

        // Reset the form after successful submission
        aiImageForm.reset();
        setImagePrompt("");
      }
    } catch (error) {
      console.error("Error creating image:", error);
    }
  }

  return (
    <Tabs defaultValue={tab} onValueChange={handleTabChange}>
      <TabsList
        className={`ring-gray ring-red mb-3 grid h-10 w-full grid-cols-2 rounded-none rounded-lg bg-lightgray dark:bg-background`}
      >
        <TabsTrigger
          value="link"
          className={` data-[state=active]:bg-brand  data-[state=active]:text-white dark:text-muted-foreground dark:data-[state=active]:bg-accent dark:data-[state=active]:text-foreground `}
        >
          Embed Link
        </TabsTrigger>
        <TabsTrigger
          value="aiimage"
          className={` data-[state=active]:bg-brand  data-[state=active]:text-white dark:text-muted-foreground dark:data-[state=active]:bg-accent dark:data-[state=active]:text-foreground `}
        >
          AI Image
        </TabsTrigger>
      </TabsList>

      <TabsContent value="link">
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
                      placeholder="Paste the image link"
                      {...form.register("url")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full items-center justify-center">
              <Button className="h-[36px]" type="submit">
                Embed Image
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
      <TabsContent value="aiimage">
        <Form {...aiImageForm}>
          <form
            onSubmit={aiImageForm.handleSubmit(createImage)}
            className="z-100 relative  flex flex-row items-center space-x-4 pb-2 pr-1"
          >
            <FormField
              control={aiImageForm.control}
              name="prompt"
              render={() => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input
                      placeholder="Enter Image Description"
                      // adjust this according to your state management
                      {...aiImageForm.register("prompt")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              variant={"outline"}
              className="absolute top-1 right-[10px] h-[30px] w-[30px] border-0 p-1"
              type="submit"
            >
              {isGenerating ? (
                <LoadingSpinner strokeColor="stroke-gray-400 dark:stroke-muted-foreground" />
              ) : (
                <Send className="dark:stroke-muted-foreground" />
              )}
            </Button>
          </form>

          <div className="flex gap-2  overflow-auto">
            {aiImageResults &&
              aiImageResults.map((el, index) => {
                return <img src={el.url} key={index} width={154} />;
              })}
          </div>
        </Form>
      </TabsContent>
    </Tabs>
  );
};
