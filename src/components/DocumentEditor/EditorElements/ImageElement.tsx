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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";
import { DraggableCore } from "react-draggable";
import useResizeElement from "@/hooks/useResizeSidebar";
import { Portal } from "react-portal";

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
  const focus = useFocused();
  const selected = useSelected();
  const [open, setOpen] = useState(
    element.url?.trim() === "" && activePath == JSON.stringify(path) && selected
  );
  // const activePath = JSON.stringify(path);

  console.log(activePath);

  const ref = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [imageWidth, setWidth] = useState(element.width); // default width

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
      <div className="absolute top-0 right-2 z-10 ">
        <OptionMenu element={element} />
      </div>
      {element.url?.trim() === "" ? (
        <div
          tabIndex={-1}
          className={`hover:bg-gray-muted relative flex  cursor-pointer items-center rounded-md bg-gray-100 p-2 transition dark:bg-background 
      dark:hover:bg-background/70`}
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
      ) : (
        <div
          tabIndex={-1}
          className="group flex"
          contentEditable={false}
          style={{
            width: "calc(100% - 30px)",
          }}
        >
          <div className="relative">
            <img src={element.url} width={imageWidth} ref={ref} />
            <div
              className="absolute top-0 -right-[4px] flex  h-full items-center"
              onMouseDown={handleMouseDown}
            >
              <div
                className={`  flex h-full  w-[18px] items-center opacity-0 transition duration-300 lg:group-hover:opacity-100 xl:pointer-events-auto `}
              >
                <div className="mx-auto block h-[60px] w-[6px]  cursor-col-resize rounded-lg bg-[#b4b4b4] dark:border dark:border-foreground dark:bg-background"></div>
              </div>
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
      .url({
        message: "Please enter a valid link",
      })
      .refine(
        (url) => {
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
          const extension = url.split(".").pop();
          return imageExtensions.includes(extension);
        },
        {
          message: "Please enter a valid image link",
        }
      ),
  });

  const {
    editor,
    activePath,
    setActivePath,
    showEditBlockPopup,
    setShowEditBlockPopup,
  } = useContext(EditorContext);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const currentElement = Node.get(editor, JSON.parse(activePath));

    const newElement = { ...currentElement, url: values.url };
    Transforms.setNodes(editor, newElement, { at: JSON.parse(activePath) });

    setShowEditBlockPopup({
      open: false,
      element: null,
    });

    setActivePath("");
  }
  const inputRef = useRef();

  useEffect(() => {
    if (showEditBlockPopup.open) {
      form.setFocus("url");
    }
  }, [showEditBlockPopup, form.setValue]);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="z-100 space-y-2 p-1 pb-2"
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
          <Button type="submit">Embed Image</Button>
        </div>
      </form>
    </Form>
  );
};
