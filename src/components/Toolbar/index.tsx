import { EditorContext } from "@/contexts/EditorContext";
import { useContext, useEffect, useRef, useState } from "react";
import { FaBold } from "react-icons/fa";
import { FiItalic, FiUnderline } from "react-icons/fi";
import { ImStrikethrough, ImLink } from "react-icons/im";
import { MdChecklist } from "react-icons/md";
import { List, ListOrdered, ListChecks } from "lucide-react";
import { genNodeId } from "@/hoc/withID";
import { ChangeBlocks } from "../ChangeBlocks";

import { BsSoundwave } from "react-icons/bs";
import {
  isBlockActive,
  toggleBlock,
  isFormatActive,
  toggleFormat,
  wrapWithTTS,
  isParentTTS,
} from "../DocumentEditor/helpers/toggleBlock";
import {
  Editor,
  Transforms,
  Text,
  Range,
  Element as SlateElement,
} from "slate";
import { ReactEditor } from "slate-react";
import { useTheme } from "styled-components";
import { X } from "lucide-react";
import React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ToolbarProps = {
  openLink: boolean;
  showMiniToolbar: boolean;
  setOpenLink: (value: boolean) => void;
  setShowMiniToolbar: (value: boolean) => void;
};

interface LinkElement extends SlateElement {
  type: "link";
  url: string;
  children: Node[];
}

export const Toolbar: React.FC<ToolbarProps> = ({
  openLink,
  showMiniToolbar,
  setOpenLink,
  setShowMiniToolbar,
}) => {
  const { editor } = useContext(EditorContext);

  const { isInline } = editor;

  editor.isInline = (element) =>
    ["link"].includes(element.type) || isInline(element);

  const theme = useTheme();
  const [inputValue, setInputValue] = useState("");

  const urlInputRef = useRef<any>(null);

  const LIST_TYPES = ["numbered-list", "bulleted-list", "checked-list"];

  const getActiveLinkUrl = (editor) => {
    let linkUrl = "";
    for (const [node] of Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
    })) {
      const linkNode = node as LinkElement;
      if (linkNode.url) {
        linkUrl = linkNode.url;
        break;
      }
    }
    return linkUrl;
  };

  const toolbarRef = useRef(null);

  const findFirstFocusableElement = (parent) => {
    const focusableElements = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input[type='text']:not([disabled])",
      "select:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ];

    const query = focusableElements.join(", ");
    return parent.current ? parent.current.querySelector(query) : null;
  };

  const hasURL = getActiveLinkUrl(editor);

  useEffect(() => {
    if (openLink) {
      setInputValue(getActiveLinkUrl(editor));
    }
  }, [openLink, editor]);

  useEffect(() => {
    if (openLink) {
      ReactEditor.blur(editor);
      urlInputRef.current.focus();
    }
  }, [openLink]);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const unwrapLink = (editor) => {
    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
    });
  };

  const isLinkActive = (editor) => {
    const [link] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
    });
    return !!link;
  };

  const unLink = () => {
    unwrapLink(editor);
    setShowMiniToolbar(false);
  };

  const insertLink = (url) => {
    if (isLinkActive(editor)) {
      unwrapLink(editor);
    }

    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
    const link = {
      id: genNodeId(),
      type: "link",
      url,
      children: isCollapsed ? [{ text: url }] : [],
    };

    if (isCollapsed) {
      Transforms.insertNodes(editor, link);
    } else {
      Transforms.wrapNodes(editor, link, { split: true });
      Transforms.collapse(editor, { edge: "end" });
    }

    setShowMiniToolbar(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent page reload

    console.log(inputValue);
    insertLink(inputValue);
    setInputValue(""); // Clear the input field
    setOpenLink(false); // Close the link input
  };

  console.log(isParentTTS(editor));

  const buttonsList = [
    {
      name: "Bold",
      action: (e) => {
        e.preventDefault();
        toggleFormat(editor, "bold");
      },
      icon: <FaBold />,
      isActive: isFormatActive(editor, "bold"),
      additionalClass:
        "rounded-lg p-[5px] ml-1 transition duration-300 hover:bg-gray-200 hover:dark:bg-muted",
    },
    {
      name: "Italic",
      action: (e) => {
        e.preventDefault();
        toggleFormat(editor, "italic");
      },
      icon: <FiItalic />,
      isActive: isFormatActive(editor, "italic"),
      additionalClass:
        "rounded-lg p-[5px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted",
    },
    {
      name: "Underline",
      action: (e) => {
        e.preventDefault();
        toggleFormat(editor, "underline");
      },
      icon: <FiUnderline />,
      isActive: isFormatActive(editor, "underline"),
      additionalClass:
        "rounded-lg p-[5px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted",
    },
    {
      name: "Strikethrough",
      action: (e) => {
        e.preventDefault();
        toggleFormat(editor, "strikethrough");
      },
      icon: <ImStrikethrough />,
      isActive: isFormatActive(editor, "strikethrough"),
      additionalClass:
        "rounded-lg p-[5px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted",
    },
    {
      name: "Link",
      action: () => setOpenLink(true),
      icon: <ImLink />,
      isActive: hasURL,
      additionalClass:
        "rounded-lg p-[5px] mr-1 transition duration-300 hover:bg-gray-200 hover:dark:bg-muted",
    },
    {
      separator: true,
    },
    {
      name: "Bulleted List",
      action: (e) => {
        e.preventDefault();
        toggleBlock(editor, "bulleted-list");
      },
      icon: <List width={20} height={20} />,
      isActive: isBlockActive(editor, "bulleted-list", "type"),
      additionalClass:
        "rounded-lg p-[4px] ml-1 transition duration-300 hover:bg-gray-200 hover:dark:bg-muted",
    },
    {
      name: "Ordered List",
      action: (e) => {
        e.preventDefault();
        toggleBlock(editor, "numbered-list");
      },
      icon: <ListOrdered width={20} height={20} />,
      isActive: isBlockActive(editor, "numbered-list", "type"),
      additionalClass:
        "rounded-lg p-[4px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted",
    },
    {
      name: "Todo List",
      action: (e) => {
        e.preventDefault();
        toggleBlock(editor, "checked-list");
      },
      icon: <MdChecklist width={20} height={20} />,
      isActive: isBlockActive(editor, "checked-list", "type"),
      additionalClass:
        "rounded-lg p-[4px] mr-1 transition duration-300 hover:bg-gray-200 hover:dark:bg-muted",
    },
  ];

  return (
    <div
      className="relative flex h-[36px] items-center focus:ring-2 focus:ring-black"
      style={{
        minWidth: 340,
        transition: "all 0.2s ease-in-out",
      }}
      tabIndex={-1}
      ref={toolbarRef}
    >
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger>
            <ChangeBlocks openLink={openLink} />
          </TooltipTrigger>
          <TooltipContent
            className="text-bold  border-black text-white  dark:bg-white dark:text-gray-600"
            side="top"
            sideOffset={10}
          >
            <p className="text-[12px]">Turn Into</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="h-full w-[1px] bg-gray-200 dark:bg-gray-700"></div>

      {!isParentTTS(editor) && (
        <>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger>
                <button
                  className={`ml-1 mr-1 flex h-[28px]  items-center rounded-lg   py-1 px-2 text-xs transition duration-300 hover:bg-gray-200 hover:dark:bg-muted `}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    wrapWithTTS(editor);
                  }}
                  disabled={isParentTTS(editor)}
                >
                  <BsSoundwave />
                  <span className="ml-1 w-[72px]">Text to MP3</span>
                </button>
                <div className="h-full w-[1px] bg-gray-200 dark:bg-gray-700"></div>
              </TooltipTrigger>
              <TooltipContent
                className="text-bold border-black text-white  dark:bg-white dark:text-gray-600"
                side="top"
                sideOffset={10}
              >
                <p className="text-[12px]">Wrap block into Text to MP3.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
      {!openLink &&
        buttonsList.map((button, i) =>
          button.separator ? (
            <div
              key={i}
              className="h-full w-[1px] bg-gray-200 dark:bg-gray-700"
            ></div>
          ) : (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger>
                  <button
                    key={i}
                    className={`flex h-[28px] w-[28px] items-center ${button.additionalClass}`}
                    onMouseDown={button.action}
                  >
                    {React.cloneElement(button.icon, {
                      className: `${
                        button.isActive
                          ? "text-brand"
                          : "text-darkblue dark:text-foreground"
                      }`,
                    })}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  className="text-bold  border-black text-white dark:bg-white dark:text-gray-600"
                  side="top"
                  sideOffset={10}
                >
                  <p className="text-[12px]">{button.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        )}

      {openLink && (
        <div className=" absolute left-0 flex  w-full items-center p-1 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex w-full">
            <input
              ref={urlInputRef}
              className=" h-[30px] w-[75%] rounded border border-gray-400 px-1 focus:border-[#007AFF] focus:outline-none dark:bg-secondary dark:focus:border-foreground "
              value={inputValue}
              placeholder="Enter URL"
              onChange={handleInputChange}
              onBlur={(e) => e.preventDefault()}
            />
            <button
              className="grow p-1 text-sm font-semibold text-brand dark:text-foreground"
              type="submit"
            >
              Apply
            </button>
          </form>
          {hasURL && (
            <button
              className="grow p-1 pr-2 text-sm font-semibold text-brand dark:text-foreground "
              onClick={unLink}
            >
              Unlink
            </button>
          )}
        </div>
      )}
    </div>
  );
};
