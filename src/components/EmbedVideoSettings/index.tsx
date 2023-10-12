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
import { Label } from "../ui/label";
import { extractVideoID } from "@/utils/helpers";

export const EmbedVideoSettings = ({ element }) => {
  const { editor, activePath } = useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);

  const { copied, copyToClipboard } = useClipboard();

  const [embedLink, setEmbedLink] = useState(element.actualLink ?? null);

  const [startTime, setStartTime] = useState(0);

  const getVideoDetailsMutation = api.workspace.getVideoDetails.useMutation();

  const videoDuration = JSON.parse(element.videoDetails).lengthSeconds;

  const [loading, setLoading] = useState(false);
  const [startTimeError, setStartTimeError] = useState<string | null>(null);

  console.log(JSON.parse(element.videoDetails).videoId);
  useEffect(() => {
    if (element.actualLink) {
      setEmbedLink(element.actualLink);
    }
  }, [element.address]);

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

  const validateStartTime = (value: string) => {
    // Clear previous errors
    setStartTimeError(null);

    // Convert string to number
    const numberValue = Number(value);

    // Validate: Ensure input is a number
    if (isNaN(numberValue)) {
      setStartTimeError("Start time must be a valid number");
      return false;
    }

    // Validate: Ensure number is not negative
    if (numberValue < 0) {
      setStartTimeError("Start time cannot be negative");
      return false;
    }

    // Validate: Ensure number is an integer
    if (!Number.isInteger(numberValue)) {
      setStartTimeError("Start time must be an integer");
      return false;
    }

    // Validate: Ensure start time is less than video duration
    if (numberValue > videoDuration) {
      setStartTimeError(`Start time cannot be more than ${videoDuration}s`);
      return false;
    }

    // Validation passed
    return true;
  };

  async function onSubmit(values: z.infer<typeof embedLinkFormSchema>) {
    setLoading(true);
    const currentElement = Node.get(editor, JSON.parse(activePath));

    const actualLink = values.url;
    let newUrl = values.url;

    const videoId = extractVideoID(values.url);

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

    newUrl = `https://www.youtube.com/embed/${videoId}`;

    const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    const newElement = {
      ...currentElement,
      embedLink: newUrl,
      videoId,
      videoDetails,
      actualLink,
      thumbnail,
      align: "start",
      width: 680,
      height: 382.5,
    };
    Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });

    setLoading(false);
  }

  const form = useForm<z.infer<typeof embedLinkFormSchema>>({
    resolver: zodResolver(embedLinkFormSchema),
    reValidateMode: "onChange",
  });

  const onChangeStartTime = (e) => {
    const currentElement = Node.get(editor, JSON.parse(activePath));

    const newElement = {
      ...currentElement,
      startTime: e.target.value,
    };
    const value = e.target.value;
    setStartTime(value);

    // Validate the input
    const validated = validateStartTime(value);

    if (validated) {
      Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });
    }
  };

  return (
    <div>
      <div className="border-b p-4">
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
                className="d h-[36px] w-full border border-gray-300 disabled:opacity-70 "
                type="submit"
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : " Update Link"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="p-4">
        <h2 className="mb-3 text-sm font-bold">Playback Settings</h2>

        <Label>Start Time</Label>
        <Input
          defaultValue={startTime}
          type="number"
          onChange={debounce(onChangeStartTime, 200)}
          className="mt-2"
        />
        {startTimeError && (
          <p className="mt-1 text-red-500">{startTimeError}</p>
        )}
      </div>
    </div>
  );
};
