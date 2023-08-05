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
import { Input } from "../ui/input";
import { api } from "@/utils/api";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { UserContext } from "@/contexts/UserContext";

import { Editor, Range, Transforms } from "slate";
import { getHtmlFromSelection } from "@/utils/htmlSerialiser";

import { Check, ChevronUp, Info, ListEnd, Send } from "lucide-react";

import { ChevronDown, Link, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deserialize } from "@/hoc/withPasting";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { Label } from "../ui/label";
import { useClipboard } from "@/hooks/useClipboard";
import { useLocalStorage } from "usehooks-ts";
import { cn } from "@/utils/cn";

export const AIAssist = ({ openChat, setOpenChat }) => {
  const { editor } = useContext(EditorContext);
  const { credits, setCredits }: any = useContext(UserContext);

  const notEnoughCredits = credits < 250;
  const [promptValue, setPromptValue] = useState("");
  const translationMutation = api.gpt.translate.useMutation();

  const [translateLoading, setTranslateLoading] = useState(false);
  const [translatedTextHTML, setTranslateTextHTML] = useState("");

  const {
    copied: translatedCopy,
    copyToClipboard: copytranslatedCopy,
    copyHTML: copyTranslatedHTML,
  } = useClipboard();

  const aiAssistFormSchema = z.object({
    prompt: z.string().nonempty("Please enter a description"),
  });

  const aiAssistForm = useForm<z.infer<typeof aiAssistFormSchema>>({
    resolver: zodResolver(aiAssistFormSchema),
    reValidateMode: "onChange",
  });

  const languages = [
    "English",
    "Spanish",
    "French",
    "Hindi",
    "Italian",
    "German",
    "Polish",
    "Portuguese",
  ];

  // Append selected text to input value when editor.selection changes
  useEffect(() => {
    if (editor.selection && !Range.isCollapsed(editor.selection)) {
      const html = getHtmlFromSelection(editor);
      console.log(html);
      setPromptValue(html);
    } else {
      setPromptValue(null);
    }
  }, [editor.selection, editor.children]);

  const [genOpen, setGenOpen] = useState(false);

  const onGenOpen = (value) => {
    setGenOpen(value);
  };

  const copyHTML = (htmlString) => {
    copyTranslatedHTML(htmlString);
  };

  const openAIAssist = () => {
    setOpenChat(!openChat);
  };

  const startTranslate = async (lang) => {
    setTranslateLoading(true);

    try {
      const response = await translationMutation.mutateAsync({
        language: lang,
        prompt: promptValue,
      });
      if (response) {
        setTranslateLoading(false);
        setTranslateTextHTML(response);

        console.log(response);
      }
    } catch (error) {
      setTranslateLoading(false);
      console.error("Error translating:", error);
    }
  };

  const startGenerateContent = async (value) => {
    setTranslateLoading(true);

    // try {
    //   const response = await translationMutation.mutateAsync({
    //     language: lang,
    //     prompt: promptValue,
    //   });
    //   if (response) {
    //     setTranslateLoading(false);
    //     setTranslateTextHTML(response);

    //     console.log(response);
    //   }
    // } catch (error) {
    //   setTranslateLoading(false);
    //   console.error("Error translating:", error);
    // }
  };

  const pasteHtml = (html, editor) => {
    // Parse the HTML.
    const parsed = new DOMParser().parseFromString(html, "text/html");

    // Deserialize the parsed HTML to a Slate fragment.
    const fragment = deserialize(parsed.body);

    // Get the point before the insert operation.
    const pointBeforeInsert = Editor.start(editor, editor.selection.focus.path);

    // Insert the fragment into the editor.
    Transforms.insertFragment(editor, fragment);

    // Get the point after the insert operation.
    const pointAfterInsert = Editor.end(editor, editor.selection.focus.path);

    // Return the range that covers the inserted fragment.
    return Editor.range(editor, pointBeforeInsert, pointAfterInsert);
  };

  const replaceSelectedText = () => {
    if (!editor.selection) return;

    // The pasteHtml function now returns a range.
    const newRange = pasteHtml(translatedTextHTML, editor);
    const currentSelection = editor.selection;
    // Set the new range as the active selection.
    Transforms.setSelection(editor, currentSelection);
  };

  const insertTranslatedTextBelow = () => {
    if (!editor.selection) return;

    // Parse the HTML.
    const parsed = new DOMParser().parseFromString(
      translatedTextHTML,
      "text/html"
    );

    // Deserialize the parsed HTML to a Slate fragment.
    const fragment = deserialize(parsed.body);

    // Save the current selection.
    const currentSelection = editor.selection;

    // Collapse the selection to the end.
    const selectionEnd = Range.isExpanded(editor.selection)
      ? Range.end(editor.selection)
      : editor.selection.anchor;
    Transforms.collapse(editor, { edge: "end" });

    // Insert the fragment at the selection.
    Transforms.insertNodes(editor, fragment);

    // Reset the selection to the previous selection.
    Transforms.setSelection(editor, currentSelection);
  };

  const renderAIAssist = () => {
    const text = getHtmlFromSelection(editor);

    return (
      <div
        className="h-full w-full items-end overflow-y-auto px-2 pb-[62px] "
        // style={{
        //   height: "calc(100vh - 42px)",
        // }}
      >
        <div className="sticky top-0 z-10 block flex items-center bg-white pb-2  pt-2 dark:bg-muted">
          <Form {...aiAssistForm}>
            <form
              onSubmit={aiAssistForm.handleSubmit(startGenerateContent)}
              className="z-100 relative flex  w-full flex-row items-center pb-2"
            >
              <FormField
                control={aiAssistForm.control}
                name="prompt"
                render={() => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input
                        placeholder="Ask AI"
                        // adjust this according to your state management
                        {...aiAssistForm.register("prompt")}
                        className="w-full pr-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="absolute right-[40px]  top-[5px] mb-2 flex  h-[30px] w-[50px] items-center justify-center rounded-md border border-accent text-sm">
                20 cr
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
                      {translateLoading ? (
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
          </Form>
        </div>
        {promptValue && (
          <div className=" mt-2 w-full rounded-md border border-gray-300 p-2 dark:border-accent">
            <div className="flex items-center gap-3 ">
              <div className="relative inline-block text-left">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="border border-gray-300 text-xs text-muted-foreground dark:border-accent"
                      variant="outline"
                      size="xs"
                    >
                      Translate
                      {/* {selectedLanguage} */}
                      <ChevronDown className="w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="border bg-muted dark:border-gray-700"
                    side="top"
                  >
                    {languages.map((language, index) => (
                      <DropdownMenuItem
                        key={index}
                        className="text-foreground"
                        onClick={() => startTranslate(language)}
                      >
                        {language}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* {translateLoading && (
                <div className="absolute right-6">
                  <LoadingSpinner strokeColor="stroke-gray-200 dark:stroke-muted-foreground" />
                </div>
              )} */}

              {/* {promptValue && (
                <Button
                  className="text-sm"
                  size="xs"
                  onClick={startTranslate}
                  disabled={translateLoading}
                >
                  {translateLoading ? (
                    <LoadingSpinner strokeColor="stroke-gray-200 dark:stroke-muted" />
                  ) : (
                    "Translate"
                  )}
                </Button>
              )} */}
            </div>
            <div className="relative">
              <Label className="absolute -top-2 right-3 bg-white px-2 text-xs text-muted-foreground dark:bg-muted ">
                Selected Text
              </Label>

              <div className=" mt-1 rounded-md  border border-gray-300 dark:border-accent">
                <div
                  dangerouslySetInnerHTML={{ __html: promptValue }}
                  className=" scrollbar h-[100px] w-full resize-none overflow-y-auto  bg-transparent p-2 p-2 outline-none ring-muted-foreground focus:ring-1 "
                ></div>
              </div>
            </div>
          </div>
        )}
        {translatedTextHTML && promptValue && (
          <div>
            <div className="relative">
              {/* <textarea
                className="relative mt-3 h-[140px] w-full resize-none rounded-md  border border-accent bg-transparent p-2 outline-none ring-muted-foreground focus:ring-1"
                value={translateText}
                onChange={(e) => {
                  setTranslatedText(e.target.value);
                  const convertToHTML = convertLineBreaksToParagraphs(
                    e.target.value
                  );

                  setTranslateTextHTML(convertToHTML);
                }}
              /> */}

              <div className=" mt-3 h-[140px] w-full resize-none  overflow-y-auto rounded-md  border border-accent bg-transparent p-2 outline-none">
                <div dangerouslySetInnerHTML={{ __html: translatedTextHTML }} />
              </div>
              <Button
                variant="outline"
                className="absolute bottom-2 right-2 border bg-white text-xs text-muted-foreground dark:bg-muted "
                size="xs"
                onClick={() => copyHTML(translatedTextHTML)}
              >
                <Copy className="mr-2 w-4 " />
                {translatedCopy ? "Copied!" : "Copy"}
              </Button>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                className="border text-muted-foreground"
                size="xs"
                onClick={replaceSelectedText}
              >
                <Check className="mr-2 w-5 " /> Replace Selection
              </Button>
              <Button
                variant="outline"
                className="border text-muted-foreground"
                size="xs"
                onClick={insertTranslatedTextBelow}
              >
                <ListEnd className="mr-2 w-5 " /> Insert below
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        `transition-height relative mt-4 w-full overflow-hidden rounded-md border border-gray-300  bg-white dark:border-accent dark:bg-muted dark:text-lightgray  lg:block ${
          openChat ? "h-[330px] duration-100" : "h-[42px] duration-0"
        }`
      )}
    >
      <button
        className="flex w-full  justify-between  border-b border-gray-300 p-2 px-3 text-muted-foreground dark:border-accent"
        onClick={openAIAssist}
      >
        AI Assist {openChat ? <ChevronDown /> : <ChevronUp />}
      </button>

      {renderAIAssist()}
    </div>
  );
};
