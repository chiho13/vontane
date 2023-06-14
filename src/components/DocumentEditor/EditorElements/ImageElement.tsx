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
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css"; // Optional CSS effect
import { DownloadButton } from "@/components/DownloadButton";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BlockAlign } from "@/components/BlockAlign";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "@supabase/auth-helpers-react";

import { env } from "@/env.mjs";

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
import { useRouter } from "next/router";
import { nanoid } from "nanoid";

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

async function urlToBlob(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response);
      }
    };
    xhr.onerror = (err) => reject(err);
    xhr.send();
  });
}

function generateRandomFilename(file) {
  const extension = file.name.split(".").pop();
  const id = nanoid();
  return `${id}.${extension}`;
}

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
    tempBase64,
  } = useContext(EditorContext);

  const path = ReactEditor.findPath(editor, element);
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;

  const [isResizing, setIsResizing] = useState(false);
  const [imageWidth, setWidth] = useState(element.width); // default width
  const [imageHeight, setHeight] = useState(element.height); // default height

  const [imageURL, setImageURL] = useState(element.url);

  const [align, setAlign] = useState(element.align || "start");

  const selected = useSelected();
  const ref = useRef(null);
  const handleMouseDown = useCallback((e) => {
    setIsResizing(true);
  }, []);

  const [hasFetched, setHasFetched] = useState(false);
  // const [imageURL, setImageURL] = useLocalStorage(
  //   element.file_name,
  //   element.url
  // );

  const [tempURL, setTempURL] = useState(element.tempURL);

  api.gpt.getAIImage.useQuery(
    { fileName: element.file_name, workspaceId },
    {
      enabled: !!element.file_name && !hasFetched && !tempBase64,
      onSuccess: async (data) => {
        const currentElement = Node.get(editor, path);
        const blob = await urlToBlob(data.signedURL);
        const base64Image = await blobToBase64(blob);
        setImageURL(base64Image);
        console.log("get ai image");
        setHasFetched(true); // set hasFetched to true after the first successful fetch
      },
      cacheTime: 5 * 60 * 1000,
      staleTime: 5 * 60 * 1000,
    }
  );

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
        let newWidth;
        if (align === "end") {
          // When the alignment is "end", calculate the new width based on the difference between
          // the right edge of the image and the mouse position
          newWidth = ref.current.getBoundingClientRect().right - e.clientX;
        } else {
          // Otherwise, calculate the new width as before
          newWidth = e.clientX - ref.current.getBoundingClientRect().left;
        }

        if (newWidth < 250) {
          // If it is, set the width to the minimum width
          setWidth(250);
        } else {
          // Otherwise, use the new width
          setWidth(newWidth);
        }
      }
    },
    [isResizing, align] // Also add "align" to the dependency array
  );

  // State for image loading status
  const [loadingImage, setLoadingImage] = useState(true);

  // Event handler for image load
  const handleImageLoad = () => {
    setLoadingImage(false);
  };

  // Apply the blur filter if the image is still loading
  const imageStyle = loadingImage
    ? { filter: "blur(10px)", transition: "filter 0.3s" }
    : { transition: "filter 0.3s" };

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
      {!imageURL ? (
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
                <img src={tempURL} width={100} className="rounded-md" />
                <span className="ml-4 opacity-80">Uploading...</span>
              </div>
            )}

            {children}
          </div>
          <div className="absolute  top-0 right-2 z-10 flex opacity-0 group-hover:opacity-100 ">
            <OptionMenu element={element} />
          </div>
        </>
      ) : (
        <div
          tabIndex={-1}
          className={`flex justify-${align}`}
          contentEditable={false}
          style={{
            width: "calc(100% - 10px)",
          }}
        >
          <div className="relative rounded-md bg-gray-200 dark:bg-background">
            <img
              src={imageURL}
              width={imageWidth}
              height={imageHeight}
              ref={ref}
              className="rounded-md"
            />
            <div
              className={`absolute top-0 ${
                align === "end" ? "-left-[3px]" : "-right-[3px]"
              } flex h-full items-center`}
              onMouseDown={handleMouseDown}
            >
              <div
                className={`  flex h-full  w-[18px] items-center opacity-0  lg:group-hover:opacity-100 xl:pointer-events-auto `}
              >
                <div className="mx-auto block h-[60px] w-[6px]  cursor-col-resize rounded-lg border border-foreground bg-[#b4b4b4] dark:bg-background"></div>
              </div>
            </div>
            <div className="absolute top-0 right-1 z-10 flex items-center gap-1  ">
              <BlockAlign element={element} />
              <DownloadButton
                url={element.url}
                fileName={element.file_name}
                className=" h-[22px] w-[22px] rounded-md border-0 p-[4px] dark:bg-muted hover:dark:bg-muted/90 "
                iconClassName="dark:stroke-foreground"
              />
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
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;

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

  const [aiImageResults, setAIImageResults] = useState<Array<{ url: any }>>([]);

  const supabaseClient = createClient(
    "https://nhntzctfhbydiddzcdqk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obnR6Y3RmaGJ5ZGlkZHpjZHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg3MTk2NjMsImV4cCI6MTk5NDI5NTY2M30.vSY659K3BlRLcfhL_FECCATkhfbx5dZTfmQ7lJtwKr0"
  );

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

  const [tab, setTab] = useLocalStorage("imagetab", "link");

  const handleTabChange = (newTab) => {
    setTab(newTab); // This will also update value in localStorage
  };

  const genImage = api.gpt.createimage.useMutation();

  const selectImage = api.gpt.selectImage.useMutation();

  const uploadImageFile = api.gpt.selectImageFromBase64.useMutation();

  async function createImage(values: z.infer<typeof aiImageFormSchema>) {
    if (isGenerating) return;
    setIsGenerating(true);
    setAIImageResults([]);
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

  async function handleImageSelect(imageURL: string) {
    const currentElement = Node.get(editor, JSON.parse(activePath));

    const newElement = {
      ...currentElement,
      url: imageURL, // use the base64 string as the temporary URL
      align: "start",
    };
    Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });
    setShowEditBlockPopup({
      open: false,
      element: null,
    });
    setIsUploading(true);
    try {
      const response = await selectImage.mutateAsync({
        imageURL,
        workspaceId,
      });
      if (response) {
        console.log(response);

        const updatedElement = {
          ...currentElement,
          file_name: response.fileName,
          image_type: "ai",
          align: "start",
        };

        Transforms.setNodes(editor, updatedElement, {
          at: JSON.parse(activePath),
        });

        setActivePath("");
        // Reset the form after successful submission
      }
    } catch (error) {
      console.error("Error creating image:", error);
    }
  }
  const session = useSession();

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

    const expiresIn = 60 * 60 * 24 * 7; // 24 hours in seconds
    const { data: signedURL, error: signedURLError } =
      await supabaseClient.storage
        .from("dalle")
        .createSignedUrl(filePath, expiresIn);

    if (signedURLError || !signedURL) {
      throw new Error("Failed to generate signed URL for the image file.");
    }

    return { fileName, url: signedURL.signedUrl };
  }

  async function handleImageUpload(file: File, tempURL: string) {
    const currentElement = Node.get(editor, JSON.parse(activePath));
    const randomFileName = generateRandomFilename(file);
    const blob = await urlToBlob(tempURL);
    const base64Image = await blobToBase64(blob);
    const newElement = {
      // file_name: randomFileName,
      url: tempURL,
      align: "start",
    };

    Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });
    setShowEditBlockPopup({
      open: false,
      element: null,
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

        const uploadedblob = (await urlToBlob(response.url)) as Blob;

        const objectUrl = URL.createObjectURL(uploadedblob);
        const updatedElement = {
          file_name: response.fileName,
          image_type: "ai",
          align: "start",
        };

        Transforms.setNodes(editor, updatedElement, {
          at: JSON.parse(activePath),
        });

        console.log("upload complete");

        setActivePath("");
        // Reset the form after successful submission
      }
    } catch (error) {
      console.error("Error creating image:", error);
    }
  }

  return (
    <Tabs defaultValue={tab} onValueChange={handleTabChange}>
      <TabsList
        className={`ring-gray ring-red mb-3 grid h-10 w-full grid-cols-3 rounded-none rounded-lg bg-lightgray dark:bg-background`}
      >
        <TabsTrigger
          value="upload"
          className={` data-[state=active]:bg-brand  data-[state=active]:text-white dark:text-muted-foreground dark:data-[state=active]:bg-accent dark:data-[state=active]:text-foreground `}
        >
          Upload
        </TabsTrigger>

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

      <TabsContent value="upload">
        <Form {...uploadForm}>
          <form className="z-100 relative mx-auto w-[90%] items-center space-y-3 py-2">
            <FormField
              control={uploadForm.control}
              name="upload"
              render={() => (
                <FormItem>
                  {/* <FormLabel>Upload Image</FormLabel> */}
                  <FormControl>
                    <label className=" flex h-10 cursor-pointer justify-center rounded bg-primary py-2 px-4 text-center text-primary-foreground outline-0 transition duration-300 hover:bg-primary/90">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files[0];
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
            className="z-100 relative  flex flex-row items-center space-x-4 pb-2"
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
  );
};
