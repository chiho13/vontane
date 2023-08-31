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

import { Editor, Path, Range, Transforms } from "slate";
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
import { useRouter } from "next/router";

import katex from "katex";
import "katex/dist/katex.min.css"; // Import the KaTeX CSS

const renderMathInHtmlString = (htmlString) => {
  // Parse the HTML string into a DOM object
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const blockEquations = doc.querySelectorAll('div[data-type="equation"]');
  const inlineEquations = doc.querySelectorAll(
    'span[data-type="inline-equation"]'
  );

  // If no equations are found, return the original string
  if (blockEquations.length === 0 && inlineEquations.length === 0) {
    return htmlString;
  }

  // Function to render equations
  const renderEquations = (element, displayMode) => {
    const latex = element.getAttribute("data-latex");
    if (latex) {
      const renderedLatex = katex.renderToString(latex, { displayMode });
      element.innerHTML = renderedLatex;
    }
  };

  // Render block equations
  blockEquations.forEach((element) => {
    renderEquations(element, true);
  });

  // Render inline equations
  inlineEquations.forEach((element) => {
    renderEquations(element, false);
  });

  // Serialize the modified DOM object back into a string
  return doc.body.innerHTML;
};

export const AIAssist = ({ openChat, setOpenChat }) => {
  const { editor, setLastActiveSelection } = useContext(EditorContext);
  const { credits, setCredits }: any = useContext(UserContext);

  const router = useRouter();
  const notEnoughCredits = credits < 100;

  const [promptValue, setPromptValue] = useState("");

  // const [inputValue, setInputValue] = useState("");

  const translationMutation = api.gpt.translate.useMutation();

  const summariseMutation = api.gpt.summarise.useMutation();

  const keypointsMutation = api.gpt.keypoints.useMutation();

  const doSomethingMutation = api.gpt.dosomething.useMutation();

  const justAskMutation = api.gpt.justask.useMutation();

  const [gptLoading, setgptLoading] = useState(false);
  const [translatedTextHTML, setTranslateTextHTML] = useState("");

  const [displayResultHTML, setDisplayResultHTML] = useState("");

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
    "Japanese",
    "Korean",
    "Chinese",
    "Malay",
    "Spanish",
    "Hindi",
    "Italian",
    "German",
    "Polish",
    "Portuguese",
    "French",
  ];

  const [genOpen, setGenOpen] = useState(false);

  const [selectedTextTooltip, setSelectedTextTooltip] = useState(false);

  // Append selected text to input value when editor.selection changes
  useEffect(() => {
    if (editor.selection && !Range.isCollapsed(editor.selection)) {
      const html = getHtmlFromSelection(editor);
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
    if (notEnoughCredits) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, upgrade: "true" },
      });

      return;
    }

    setgptLoading(true);

    try {
      const response = await translationMutation.mutateAsync({
        language: lang,
        prompt: promptValue,
      });
      if (response) {
        setSelectedTextTooltip(false);
        setgptLoading(false);
        setTranslateTextHTML(response.data);
        setCredits(response.credits);
        const displayHTML = renderMathInHtmlString(response.data);

        console.log(displayHTML);
        setDisplayResultHTML(displayHTML);
        console.log(response.data);
      }
    } catch (error) {
      setgptLoading(false);
      console.error("Error translating:", error);
    }
  };

  const startSummarise = async () => {
    if (notEnoughCredits) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, upgrade: "true" },
      });

      return;
    }
    setgptLoading(true);

    try {
      const response = await summariseMutation.mutateAsync({
        prompt: promptValue,
      });
      if (response) {
        setSelectedTextTooltip(false);
        setgptLoading(false);
        setTranslateTextHTML(response.data);
        setCredits(response.credits);

        console.log(response);
      }
    } catch (error) {
      setgptLoading(false);
      console.error("Error getting summary:", error);
    }
  };

  const startKeyPoints = async () => {
    if (notEnoughCredits) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, upgrade: "true" },
      });

      return;
    }

    setgptLoading(true);

    try {
      const response = await keypointsMutation.mutateAsync({
        prompt: promptValue,
      });
      if (response) {
        setSelectedTextTooltip(false);
        setgptLoading(false);
        setTranslateTextHTML(response.data);
        setCredits(response.credits);

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

    if (notEnoughCredits) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, upgrade: "true" },
      });

      return;
    }

    setgptLoading(true);
    if (promptValue) {
      try {
        const response = await doSomethingMutation.mutateAsync({
          userInput: value.prompt,
          prompt: promptValue,
        });
        if (response) {
          setSelectedTextTooltip(false);
          setgptLoading(false);
          setTranslateTextHTML(response.data);
          setCredits(response.credits);
          console.log(response.data);
          const displayHTML = renderMathInHtmlString(response.data);

          setDisplayResultHTML(displayHTML);
        }
      } catch (error) {
        setgptLoading(false);
        console.error("Error getting keyp points:", error);
      }
    } else {
      try {
        const response = await justAskMutation.mutateAsync({
          userInput: value.prompt,
        });
        if (response) {
          setSelectedTextTooltip(false);
          setgptLoading(false);
          setTranslateTextHTML(response.data);
          setCredits(response.credits);
          console.log(response.data);

          const displayHTML = renderMathInHtmlString(response.data);

          console.log(displayHTML);
          setDisplayResultHTML(displayHTML);
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
      <div className="h-full w-full items-end  px-2 pb-[62px]">
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

              <div
                className={cn(
                  `flex items-center justify-between gap-3 ${
                    notEnoughCredits && "justify-end"
                  }`
                )}
              >
                {!notEnoughCredits && (
                  <div className="relative flex gap-1 text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={gptLoading}>
                        <Button
                          className="border border-gray-300 bg-gray-100 text-xs text-foreground dark:border-gray-500 dark:bg-accent"
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
                        className="scrollbar max-h-[200px] overflow-y-auto border bg-muted dark:border-gray-700 dark:bg-muted"
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
                      className="border border-gray-300 bg-gray-100 text-xs text-foreground dark:border-gray-500 dark:bg-accent"
                      variant="outline"
                      size="xs"
                      onClick={startSummarise}
                      disabled={gptLoading}
                    >
                      <Quote className="mr-1 w-3" />
                      Summarise
                    </Button>
                    <Button
                      className=" border border-gray-300  bg-gray-100 text-xs text-foreground dark:border-gray-500 dark:bg-accent"
                      variant="outline"
                      size="xs"
                      onClick={startKeyPoints}
                      disabled={gptLoading}
                    >
                      <List className="mr-1 w-4" />
                      Key Points
                    </Button>
                  </div>
                )}
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
                <div className=" mt-1 rounded-md border  border-gray-300 dark:border-gray-500 ">
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
              <div className=" mt-3 h-[140px] w-full resize-none  overflow-y-auto rounded-md  border border-input bg-transparent p-2 outline-none">
                <div dangerouslySetInnerHTML={{ __html: displayResultHTML }} />
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
        className="relative flex w-full justify-between  border-b border-gray-300 p-2 px-3 text-gray-800 dark:border-accent dark:text-gray-200"
        onClick={openAIAssist}
      >
        AI Assist {"(beta)"} {openChat ? <ChevronDown /> : <ChevronUp />}
        <div className=" absolute bottom-0 right-[50px]  top-[5px] mb-2 flex h-[30px] w-[40px]  items-center justify-center rounded-md border border-accent  text-xs">
          50 cr
        </div>
      </button>

      {openChat && renderAIAssist()}
    </div>
  );
};
