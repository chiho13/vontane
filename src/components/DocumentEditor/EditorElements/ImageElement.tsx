import { useContext, useState, useEffect, useMemo, useCallback } from "react";
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

export const ImageElement = (props) => {
  const { attributes, children, element } = props;
  const { editor, showEditBlockPopup, selectedElementID } =
    useContext(EditorContext);
  const path = ReactEditor.findPath(editor, element);
  const [open, setOpen] = useState(false);
  // const activePath = JSON.stringify(path);

  const [activePath, setActivePath] = useState(null);
  const focus = useFocused();
  const selected = useSelected();
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
          ];
          const extension = url.split(".").pop();
          return imageExtensions.includes(extension);
        },
        {
          message: "Please enter a valid image link",
        }
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const newElement = { ...element, url: values.url };
    Transforms.setNodes(editor, newElement, { at: path });
  }

  return element.url?.trim() === "" ? (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="w-full">
        <div
          tabIndex={-1}
          data-path={JSON.stringify(path)}
          data-id={element.id}
          className={`hover:bg-gray-muted relative flex  cursor-pointer items-center rounded-md bg-gray-100 p-2 transition dark:bg-background 
      dark:hover:bg-background/70`}
          contentEditable={false}
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
      </DropdownMenuTrigger>

      <DropdownMenuContent className="dark:border-gray-700 dark:bg-secondary dark:text-foreground lg:w-[400px] xl:w-[500px]">
        {/* Enter link
         */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 p-1 pb-2"
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
                  {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex w-full items-center justify-center">
              <Button type="submit">Embed Image</Button>
            </div>
          </form>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div tabIndex={-1}>
      <img src={element.url} />
      {children}
    </div>
  );
};
