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
import { useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "@/contexts/EditorContext";
import { UserContext } from "@/contexts/UserContext";

import { Editor, Range, Transforms } from "slate";
import { getHtmlFromSelection } from "@/utils/htmlSerialiser";

import {
  Check,
  ChevronUp,
  Cross,
  HelpCircle,
  Info,
  Languages,
  List,
  ListChecks,
  ListEnd,
  Quote,
  Send,
  TextSelection,
  X,
} from "lucide-react";

import { ChevronDown, Link, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deserialize } from "@/hoc/withPasting";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipArrow,
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
import { BiCaretUp } from "react-icons/bi";
import { AnimatePresence, motion } from "framer-motion";
import { y_animation_props } from "../Dropdown";

export const AIAssist = ({ openChat, setOpenChat }) => {
  const { editor, setLastActiveSelection } = useContext(EditorContext);
  const { credits, setCredits }: any = useContext(UserContext);

  const notEnoughCredits = credits < 250;

  const [promptValue, setPromptValue] = useState("");

  // const [inputValue, setInputValue] = useState("");

  const translationMutation = api.gpt.translate.useMutation();

  const summariseMutation = api.gpt.summarise.useMutation();

  const keypointsMutation = api.gpt.keypoints.useMutation();

  const doSomethingMutation = api.gpt.dosomething.useMutation();

  const [gptLoading, setgptLoading] = useState(false);
  const [translatedTextHTML, setTranslateTextHTML] = useState("");

  const {
    copied: translatedCopy,
    copyToClipboard: copytranslatedCopy,
    copyHTML: copyTranslatedHTML,
  } = useClipboard();

  const aiAssistFormSchema = z.object({
    prompt: z.string(),
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

  const [genOpen, setGenOpen] = useState(false);

  const [selectedTextTooltip, setSelectedTextTooltip] = useState(false);

  // Append selected text to input value when editor.selection changes
  useEffect(() => {
    if (editor.selection && !Range.isCollapsed(editor.selection)) {
      const html = getHtmlFromSelection(editor);
      console.log(html);
      setPromptValue(html);
      setSelectedTextTooltip(true);
    } else {
      setPromptValue(null);
    }
  }, [editor.selection, editor.children]);

  const onGenOpen = (value) => {
    setGenOpen(value);
  };

  const onSelectedTextOpen = (value) => {
    setSelectedTextTooltip(value);
  };

  const copyHTML = (htmlString) => {
    copyTranslatedHTML(htmlString);
  };

  const openAIAssist = () => {
    setOpenChat(!openChat);
  };

  const startTranslate = async (lang) => {
    setgptLoading(true);

    try {
      const response = await translationMutation.mutateAsync({
        language: lang,
        prompt: promptValue,
      });
      if (response) {
        setSelectedTextTooltip(false);
        setgptLoading(false);
        setTranslateTextHTML(response);

        console.log(response);
      }
    } catch (error) {
      setgptLoading(false);
      console.error("Error translating:", error);
    }
  };

  const startSummarise = async () => {
    setgptLoading(true);

    try {
      const response = await summariseMutation.mutateAsync({
        prompt: promptValue,
      });
      if (response) {
        setSelectedTextTooltip(false);
        setgptLoading(false);
        setTranslateTextHTML(response);

        console.log(response);
      }
    } catch (error) {
      setgptLoading(false);
      console.error("Error getting summary:", error);
    }
  };

  const startKeyPoints = async () => {
    setgptLoading(true);

    try {
      const response = await keypointsMutation.mutateAsync({
        prompt: promptValue,
      });
      if (response) {
        setSelectedTextTooltip(false);
        setgptLoading(false);
        setTranslateTextHTML(response);

        console.log(response);
      }
    } catch (error) {
      setgptLoading(false);
      console.error("Error getting keyp points:", error);
    }
  };

  const startDoSomething = async (value) => {
    if (value.prompt.length === 0) return;
    // setgptLoading(true);

    if (promptValue) {
      setgptLoading(true);

      try {
        const response = await doSomethingMutation.mutateAsync({
          userInput: value.prompt,
          prompt: promptValue,
        });
        if (response) {
          setSelectedTextTooltip(false);
          setgptLoading(false);
          setTranslateTextHTML(response);

          console.log(response);
        }
      } catch (error) {
        setgptLoading(false);
        console.error("Error getting keyp points:", error);
      }
    }
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
    // Set the new range as the active selection.
    const currentSelection = editor.selection;
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
  };

  const askAIRef = useRef({}) as any;
  const openTooltipRef = useRef({}) as any;
  const selectedContent = useRef({}) as any;

  const renderAIAssist = () => {
    const text = getHtmlFromSelection(editor);

    return (
      <div
        className="h-full w-full items-end  px-2 pb-[62px]"
        // onMouseDown={() => {
        //   if (!promptValue) return;
        //   if (
        //     askAIRef.current &&
        //     !askAIRef.current.contains(event.target) &&
        //     openTooltipRef.current &&
        //     !openTooltipRef.current.contains(event.target) &&
        //     selectedContent.current &&
        //     !selectedContent.current.contains(event.target)
        //   ) {
        //     setSelectedTextTooltip(false);
        //   }
        // }}
      >
        <div className="sticky top-0 z-10 block flex items-center bg-white   pt-2 dark:bg-muted">
          <Form {...aiAssistForm}>
            <form
              onSubmit={aiAssistForm.handleSubmit(startDoSomething)}
              className="z-100 relative flex  w-full flex-row items-center"
            >
              <FormField
                control={aiAssistForm.control}
                name="prompt"
                render={() => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input
                        placeholder={`${
                          promptValue ? "Do Something with Text" : "Ask AI"
                        }`}
                        // adjust this according to your state management
                        {...aiAssistForm.register("prompt")}
                        className={cn(`w-full  dark:bg-secondary/70
                          ${promptValue ? "pr-[135px]" : "pr-[40px]"}
                        `)}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {promptValue && (
                <a
                  className=" absolute right-[40px] top-[8px] flex h-[24px] items-center rounded-md border border-gray-300 bg-gray-200 px-2 text-xs dark:border-muted-foreground dark:bg-accent "
                  onClick={() => {
                    setSelectedTextTooltip(!selectedTextTooltip);
                  }}
                  href="#"
                  ref={openTooltipRef}
                >
                  <TextSelection className="w-4" />
                  <span className="ml-1"> Selection</span>
                </a>
              )}

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
                      {gptLoading ? (
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
        <AnimatePresence>
          {promptValue && selectedTextTooltip && (
            <motion.div
              {...y_animation_props}
              className=" absolute right-[10px] z-10 w-[369px] rounded-md border border-gray-300 bg-gray-200 p-2 dark:border-gray-500 dark:bg-[#25282b]"
              ref={selectedContent}
            >
              {/* <div className="absolute -top-2 right-4  flex items-center gap-2 bg-white px-2  py-0 text-xs font-semibold text-muted-foreground dark:bg-muted dark:text-foreground ">
                Selected Text
              </div> */}

              <div className="flex items-center justify-between gap-3 ">
                <div className="relative flex gap-1 text-left">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={gptLoading}>
                      <Button
                        className="border border-gray-400 text-xs text-foreground dark:border-gray-500"
                        variant="outline"
                        size="xs"
                      >
                        <Languages className="mr-1 w-4" />
                        Translate
                        {/* {selectedLanguage} */}
                        <ChevronDown className="ml-1 w-4" />
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
                  <Button
                    className="border border-gray-400 text-xs text-foreground dark:border-gray-500"
                    variant="outline"
                    size="xs"
                    onClick={startSummarise}
                    disabled={gptLoading}
                  >
                    <Quote className="mr-1 w-3" />
                    Summarise
                  </Button>
                  <Button
                    className=" border border-gray-400  text-xs text-foreground dark:border-gray-500"
                    variant="outline"
                    size="xs"
                    onClick={startKeyPoints}
                    disabled={gptLoading}
                  >
                    <List className="mr-1 w-4" />
                    Key Points
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className=" flex h-[20px] w-[20px] justify-center rounded-full border bg-muted p-0  text-xs dark:border-gray-500 dark:bg-accent/50 dark:hover:bg-muted "
                  size="xs"
                  onClick={() => {
                    Transforms.deselect(editor);
                    setLastActiveSelection(null);
                  }}
                >
                  <X className=" h-4 w-4  p-px  " />
                </Button>
              </div>

              <div className="relative">
                {/* <div className="absolute -top-[9px] right-3 flex items-center gap-2 bg-white px-2 text-xs font-semibold text-muted-foreground dark:bg-muted ">
                  <Button
                    variant="outline"
                    className=" flex h-[20px] w-[20px] justify-center rounded-full border bg-muted p-0 text-xs "
                    size="xs"
                    onClick={() => {
                      Transforms.deselect(editor);
                      setLastActiveSelection(null);
                    }}
                  >
                    <X className=" h-5 w-5 rounded-full p-[2px] " />
                  </Button>
                </div> */}

                <div className=" mt-1 rounded-md  border border-gray-400 dark:border-gray-500">
                  <div
                    dangerouslySetInnerHTML={{ __html: promptValue }}
                    className=" scrollbar h-[80px] w-full resize-none overflow-y-auto  bg-transparent p-2 p-2 text-sm outline-none ring-muted-foreground focus:ring-1 "
                  ></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {translatedTextHTML && (
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
        `relative mt-4 w-full overflow-hidden rounded-md border border-gray-300 bg-white   dark:border-accent dark:bg-muted dark:text-lightgray  lg:block ${
          openChat ? "h-[300px]" : "h-[42px]"
        }`
      )}
    >
      <button
        className="relative flex w-full justify-between  border-b border-gray-300 p-2 px-3 text-muted-foreground dark:border-accent"
        onClick={openAIAssist}
      >
        AI Assist {openChat ? <ChevronDown /> : <ChevronUp />}
        <div className=" absolute bottom-0 right-[50px]  top-[5px] mb-2 flex h-[30px] w-[40px]  items-center justify-center rounded-md border border-accent  text-xs">
          50 cr
        </div>
      </button>

      {renderAIAssist()}
    </div>
  );
};
