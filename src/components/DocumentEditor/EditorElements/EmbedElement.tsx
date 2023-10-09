import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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

export const Embed = React.memo(
  (props: { attributes: any; children: any; element: any }) => {
    const { attributes, children, element } = props;
    const { setElementData } = useTextSpeech();
    const selected = useSelected();

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
    const [embedLink, setEmbedLink] = useState(element.embedLink);

    return (
      <div data-id={element.id} data-path={JSON.stringify(path)}>
        {!element.embedLink ? (
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
                element: "embedLink",
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
  const embedLinkForm = z.object({
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

  return <div></div>;
};
