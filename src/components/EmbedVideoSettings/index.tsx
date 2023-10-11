import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Form";

import { useContext, useEffect, useState } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { debounce } from "lodash";
import { ReactEditor } from "slate-react";
import { Element as SlateElement, Node, Transforms } from "slate";
import { Input } from "../ui/input";
import { api } from "@/utils/api";

type DownloadVideoResponse = {
  success: boolean;
  videoId?: string;
  error?: string;
};

export const EmbedVideoSettings = ({ element }) => {
  const { editor, activePath } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  const { copied, copyToClipboard } = useClipboard();

  const [embedLink, setEmbedLink] = useState(element.actualLink ?? null);

  useEffect(() => {
    if (element.actualLink) {
      setEmbedLink(element.actualLink);
    }
  }, [element.address]);

  const editAddress = (e) => {
    setEmbedLink(e.target.value);
    Transforms.setNodes(editor, { embedLink: e.target.value }, { at: path });
  };

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

    const actualLink = values.url;
    let newUrl = values.url;

    const videoId = extractVideoID(values.url);
    newUrl = `https://www.youtube.com/embed/${videoId}`;

    const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    const newElement = {
      ...currentElement,
      embedLink: newUrl,
      actualLink,
      thumbnail,
      align: "start",
      width: 680,
      height: 400,
    };
    Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });
  }

  const form = useForm<z.infer<typeof embedLinkFormSchema>>({
    resolver: zodResolver(embedLinkFormSchema),
    reValidateMode: "onChange",
  });

  const onChangeLink = (e) => {
    setEmbedLink(e.target.value);
  };

  const downloadVideoMutation = api.workspace.downloadVideo.useMutation();

  const downloadVideoHandler = async () => {
    try {
      const response = await downloadVideoMutation.mutateAsync({
        link: element.actualLink,
      });
      if (response && response.success) {
        console.log(response.success);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-3 text-sm font-bold">Embed Video Settings</h2>
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
                    defaultValue={embedLink}
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

      <Button onClick={downloadVideoHandler}>Download</Button>
    </div>
  );
};
