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
import { Image as ImageIcon, FileCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Element as SlateElement, Node } from "slate";
import { Send } from "lucide-react";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css"; // Optional CSS effect
import { DownloadButton } from "@/components/DownloadButton";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BlockAlign } from "@/components/BlockAlign";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "@supabase/auth-helpers-react";
import { blobToBase64, urlToBlob } from "@/utils/helpers";
import { supabaseClient } from "@/utils/supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Form";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { nanoid } from "nanoid";
import { useResizeBlock, Position } from "@/hooks/useResizeBlock";
import { UserContext } from "@/contexts/UserContext";

function generateRandomFilename(file) {
  const extension = file.name.split(".").pop();
  const id = nanoid();
  return `${id}.${extension}`;
}

export const ImageElement = React.memo(
  (props: { attributes: any; children: any; element: any }) => {
    const { attributes, children, element } = props;
    const {
      editor,
      showEditBlockPopup,
      selectedElementID,
      activePath,
      setActivePath,
      setShowEditBlockPopup,
      setSelectedElementID,
      setTempBase64,
      tempBase64,
    } = useContext(EditorContext);

    const path = ReactEditor.findPath(editor, element);
    const router = useRouter();
    const workspaceId = router.query.workspaceId as string;

    const [imageHeight, setHeight] = useState(element.height); // default height

    const [base64URL, setBase64URL] = useState(
      tempBase64[element.id] || element.url
    );
    const [align, setAlign] = useState(element.align || "start");

    const { handleMouseDown, setPos, ref, blockWidth } = useResizeBlock(
      element,
      editor,
      path
    );

    const [hasFetched, setHasFetched] = useState(false);

    const [tempURL, setTempURL] = useState(element.tempURL);

    // api.gpt.getAIImage.useQuery(
    //   { fileName: element.file_name, workspaceId },
    //   {
    //     enabled: true,
    //     onSuccess: async (data) => {
    //       const currentElement = Node.get(editor, path);
    //       const blob = await urlToBlob(data.signedURL);
    //       const base64Image = await blobToBase64(blob);
    //       setBase64URL(base64Image);
    //       console.log("get ai image");

    //       setHasFetched(true); // set hasFetched to true after the first successful fetch
    //     },
    //     cacheTime: 5 * 60 * 1000,
    //     staleTime: 5 * 60 * 1000,
    //   }
    // );
    return (
      <div data-id={element.id} data-path={JSON.stringify(path)}>
        {!element.file_name ? (
          <>
            <div
              tabIndex={-1}
              className={`hover:bg-gray-muted relative  flex  cursor-pointer items-center rounded-md bg-gray-100 p-2 transition dark:bg-secondary dark:hover:bg-background/70 
      hover:dark:bg-accent
      `}
              contentEditable={false}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowEditBlockPopup({
                  open: true,
                  element: "image",
                  path: JSON.stringify(path),
                });
                setActivePath(JSON.stringify(path));
                setSelectedElementID(element.id);
              }}
            >
              {!tempURL ? (
                <div className="flex items-center">
                  <ImageIcon
                    width={46}
                    height={46}
                    className="rounded-md opacity-30 dark:bg-transparent"
                  />
                  <span className="ml-4 opacity-30">Add an Image</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Image
                    src={tempURL}
                    width={100}
                    className="rounded-md"
                    alt="alt"
                  />
                  <span className="ml-4 opacity-80">Uploading...</span>
                </div>
              )}

              {children}
            </div>
            <div className="absolute  right-1 top-1 z-10 flex opacity-0 group-hover:opacity-100 ">
              <OptionMenu element={element} />
            </div>
          </>
        ) : (
          <div
            className={`group mr-1 flex justify-${align}`}
            {...attributes}
            contentEditable={false}
          >
            <div className="relative rounded-md bg-gray-200 dark:bg-background">
              <img
                src={base64URL}
                width={blockWidth}
                height={imageHeight}
                ref={ref}
                className="rounded-md"
                alt="alt"
                tabIndex={-1}
              />
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
              {tempBase64[element.id] && (
                <div className="absolute left-1 top-1 z-10 flex items-center gap-1  ">
                  {element.uploading ? (
                    <div className="rounded-md bg-black bg-opacity-50 p-[4px]">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="rounded-md bg-black  bg-opacity-50 p-[4px]">
                      <FileCheck className="text-gray-200 dark:text-white" />
                    </div>
                  )}
                </div>
              )}
              <div className="absolute right-1 top-1 z-10 flex  items-center gap-1 opacity-0 group-hover:opacity-100 ">
                {!element.uploading && (
                  <>
                    <BlockAlign element={element} />
                    <DownloadButton
                      url={element.url}
                      fileName={element.file_name}
                      className=" h-[22px] w-[22px] rounded-md border-0 p-[4px] dark:bg-muted hover:dark:bg-muted/90 "
                      iconClassName="dark:stroke-foreground"
                    />
                  </>
                )}
                <OptionMenu element={element} />
              </div>
            </div>
            {children}
          </div>
        )}
      </div>
    );
  }
);

export const ImageEmbedLink = () => {
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;
  const errorMessage = () =>
    toast.error("Something went wrong. Make sure description is safe", {
      position: toast.POSITION.TOP_CENTER,
    });

  const { credits, setCredits }: any = useContext(UserContext);

  const notEnoughCredits = credits < 250;
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

            return (
              (extension && imageExtensions.includes(extension)) ||
              isUnsplashUrl
            );
          } catch (error) {
            // If an error is thrown when constructing the URL,
            // return false to indicate that the validation failed.
            return false;
          }
        },
        { message: "Please enter a valid image link" }
      ),
  });

  const uploadSchema = z.object({
    file: z.any().refine((file) => file instanceof File, {
      message: "Please select a file",
    }),
  });

  const uploadForm = useForm<z.infer<typeof uploadSchema>>({
    resolver: zodResolver(uploadSchema),
    reValidateMode: "onChange",
  });

  const {
    editor,
    activePath,
    setActivePath,
    showEditBlockPopup,
    setShowEditBlockPopup,
    setTempBase64,
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
  const [isUploading, setIsUploading] = useState(false);

  const [aiImageResults, setAIImageResults] = useLocalStorage(
    "AIImageResults",
    []
  );

  console.log();
  const now = new Date();
  const unixTimestamp = Math.floor(now.getTime() / 1000);

  const [aitimestamp, setAITimestamp] = useLocalStorage("aitimestamp", null);

  // const supabaseClient = createClient(
  //   "https://nhntzctfhbydiddzcdqk.supabase.co",
  //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obnR6Y3RmaGJ5ZGlkZHpjZHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg3MTk2NjMsImV4cCI6MTk5NDI5NTY2M30.vSY659K3BlRLcfhL_FECCATkhfbx5dZTfmQ7lJtwKr0"
  // );

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

    const newElement = {
      ...currentElement,
      url: newUrl,
      align: "start",
      file_name: newUrl,
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

  const [tab, setTab] = useLocalStorage("imagetab", "link");

  const handleTabChange = (newTab) => {
    setTab(newTab); // This will also update value in localStorage
  };

  const genImage = api.gpt.createimage.useMutation();

  const selectImage = api.gpt.selectImage.useMutation();

  const uploadImageFile = api.gpt.selectImageFromBase64.useMutation();

  async function createImage(values: z.infer<typeof aiImageFormSchema>) {
    if (notEnoughCredits) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, upgrade: "true" },
      });

      return;
    }

    if (isGenerating) return;
    setIsGenerating(true);
    setAIImageResults([]);
    try {
      const response = await genImage.mutateAsync({
        prompt: values.prompt,
      });
      if (response && response.data) {
        console.log(response.data);

        const res = response.data;

        setCredits(response.credits);
        setAITimestamp(Math.floor(Date.now() / 1000) + 1800);
        setAIImageResults(res.data.map((item) => ({ url: item.url })));
        setIsGenerating(false);

        // Reset the form after successful submission
        aiImageForm.reset();
        setImagePrompt("");
      }
    } catch (error) {
      errorMessage();
      setIsGenerating(false);

      aiImageForm.reset();
      setImagePrompt("");
      console.error("Error creating image:", error);
    }
  }

  async function handleImageSelect(imageURL: string) {
    const currentElement = Node.get(editor, JSON.parse(activePath));
    const fileName = `${nanoid()}.png`;
    // const blob = await urlToBlob(imageURL);
    // const base64Image = await blobToBase64(blob);
    const node = Node.get(editor, JSON.parse(activePath));
    const id = SlateElement.isElement(node) && (node.id as any);

    const newElement = {
      file_name: fileName,

      align: "start",
      uploading: true,
    };
    setTempBase64((prev) => ({ ...prev, [id]: imageURL }));

    Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });
    setShowEditBlockPopup({
      open: false,
      element: null,
      path: "",
    });
    setIsUploading(true);

    try {
      const response = await selectImage.mutateAsync({
        fileName,
        imageURL,
        workspaceId,
      });
      if (response) {
        console.log(response);

        const updatedElement = {
          url: response.url,
          align: "start",
          uploading: false,
        };

        Transforms.setNodes(editor, updatedElement, {
          at: JSON.parse(activePath),
        });

        // Reset the form after successful submission
      }
    } catch (error) {
      console.error("Error creating image:", error);
    }
  }
  const session = useSession() as any;

  async function uploadImageBlob(
    fileName: string,
    file: File,
    userId: string
  ): Promise<{ fileName: string; url: string }> {
    console.log(userId);
    if (!userId) {
      throw new Error("User is not authenticated.");
    }

    const filePath = `${userId}/${workspaceId}/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("dalle")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = await supabaseClient.storage
      .from("dalle")
      .getPublicUrl(filePath);

    return { fileName, url: data.publicUrl };
  }

  async function handleImageUpload(file: File, tempURL: string) {
    const currentElement = Node.get(editor, JSON.parse(activePath));
    const randomFileName = generateRandomFilename(file);
    const blob = await urlToBlob(tempURL);
    const base64Image = await blobToBase64(blob);
    const node = Node.get(editor, JSON.parse(activePath));
    const id = SlateElement.isElement(node) && (node.id as any);

    const newElement = {
      file_name: randomFileName,
      align: "start",
      uploading: true,
    };

    setTempBase64((prev) => ({ ...prev, [id]: base64Image }));

    Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });
    setShowEditBlockPopup({
      open: false,
      element: null,
      path: "",
    });
    setIsUploading(true);
    try {
      const response = await uploadImageBlob(
        randomFileName,
        file,
        session?.user.id
      );
      if (response) {
        console.log(response);

        const updatedElement = {
          url: response.url,
          image_type: "ai",
          align: "start",
          uploading: false,
        };
        Transforms.setNodes(editor, updatedElement, {
          at: JSON.parse(activePath),
        });

        console.log("upload complete");

        // Reset the form after successful submission
      }
    } catch (error) {
      console.error("Error creating image:", error);
    }
  }

  const [genOpen, setGenOpen] = useState(false);

  const onGenOpen = (value) => {
    setGenOpen(value);
  };
  useEffect(() => {
    // Get the current Unix timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // If the stored timestamp is less than the current timestamp, it means the images have expired
    if (aitimestamp && aitimestamp < currentTimestamp) {
      // Clear the image results and the timestamp
      setAIImageResults([]);
      setAITimestamp(null);
    } else if (aitimestamp && aitimestamp >= currentTimestamp) {
      // If the images haven't expired yet, set a timeout to clear them when they do
      const timeoutId = setTimeout(() => {
        setAIImageResults([]);
        setAITimestamp(null);
      }, (aitimestamp - currentTimestamp) * 1000);

      // Clear the timeout if the component unmounts or if aitimestamp changes
      return () => clearTimeout(timeoutId);
    }
  }, [aitimestamp, setAIImageResults, setAITimestamp]);

  return (
    <>
      <Tabs defaultValue={tab} onValueChange={handleTabChange}>
        <TabsList
          className={`ring-gray ring-red mb-3 grid h-10 w-full grid-cols-3 rounded-md bg-lightgray dark:bg-accent`}
        >
          <TabsTrigger
            value="upload"
            className={` data-[state=active]:bg-brand  data-[state=active]:text-white  dark:text-muted-foreground dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background  `}
          >
            Upload
          </TabsTrigger>

          <TabsTrigger
            value="link"
            className={` data-[state=active]:bg-brand  data-[state=active]:text-white  dark:text-muted-foreground dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background  `}
          >
            Embed Link
          </TabsTrigger>
          <TabsTrigger
            value="aiimage"
            className={` data-[state=active]:bg-brand  data-[state=active]:text-white  dark:text-muted-foreground dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background  `}
          >
            AI Image
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Form {...uploadForm}>
            <form className="z-100 relative mx-auto w-[90%] items-center space-y-3 py-2">
              <FormField
                control={uploadForm.control}
                name="file.upload"
                render={() => (
                  <FormItem>
                    {/* <FormLabel>Upload Image</FormLabel> */}
                    <FormControl>
                      <label className=" flex h-10 cursor-pointer justify-center rounded border border-gray-400 bg-white px-4 py-2 text-center text-foreground outline-0 transition duration-300 hover:bg-white/80 dark:border-gray-700 dark:text-background">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file =
                              event.target.files && event.target.files[0];
                            if (file) {
                              const imageURL = URL.createObjectURL(file);

                              handleImageUpload(file, imageURL);
                            }
                          }}
                        />
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </TabsContent>

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
                <Button
                  variant="outline"
                  className="h-[36px] border border-gray-300 bg-white dark:text-background dark:hover:bg-foreground/90"
                  type="submit"
                >
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
              className="z-100 relative flex  w-full flex-row items-center pb-2"
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
                        className="w-full pr-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="absolute right-[40px]  top-[5px] mb-2 flex  h-[30px] w-[60px] items-center justify-center rounded-md border border-accent text-sm">
                250 cr
              </div>

              <TooltipProvider delayDuration={300}>
                <Tooltip
                  open={notEnoughCredits && genOpen}
                  onOpenChange={onGenOpen}
                >
                  <TooltipTrigger>
                    <Button
                      variant={"outline"}
                      className="absolute right-[5px] top-[5px] h-[30px] w-[30px] border-0 p-1"
                      type="submit"
                    >
                      {isGenerating ? (
                        <LoadingSpinner strokeColor="stroke-gray-400 dark:stroke-muted-foreground" />
                      ) : (
                        <Send className="dark:stroke-muted-foreground" />
                      )}
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent
                    side="top"
                    sideOffset={20}
                    className="dark:bg-white dark:text-black"
                  >
                    <p className="text-[12px]">Not Enough Credits</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </form>

            <div className="flex gap-2  overflow-auto">
              {isGenerating && (
                <div>
                  <div className="flex gap-2">
                    <div className=" flex h-[154px] w-[154px] items-center justify-center bg-gray-200 dark:bg-accent">
                      <LoadingSpinner
                        strokeColor="stroke-gray-400 dark:stroke-muted-foreground"
                        width={50}
                        height={50}
                      />
                    </div>
                    <div className=" flex h-[154px] w-[154px] items-center justify-center bg-gray-200 dark:bg-accent">
                      <LoadingSpinner
                        strokeColor="stroke-gray-400 dark:stroke-muted-foreground"
                        width={50}
                        height={50}
                      />
                    </div>
                    <div className=" flex h-[154px] w-[154px] items-center justify-center bg-gray-200 dark:bg-accent">
                      <LoadingSpinner
                        strokeColor="stroke-gray-400 dark:stroke-muted-foreground"
                        width={50}
                        height={50}
                      />
                    </div>
                  </div>
                </div>
              )}
              {aiImageResults &&
                aiImageResults.map((el, index) => (
                  <button
                    className="transition duration-200 hover:opacity-90"
                    onClick={() => {
                      if (isUploading) return;
                      handleImageSelect(el.url);
                    }}
                    key={index}
                  >
                    <LazyLoadImage
                      src={el.url}
                      width={154}
                      effect="blur" // Optional effect
                    />
                  </button>
                ))}
            </div>
          </Form>
        </TabsContent>
      </Tabs>
      <ToastContainer />
    </>
  );
};
