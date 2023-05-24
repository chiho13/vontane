import { EditorContext } from "@/contexts/EditorContext";
import { useContext, useEffect, useRef, useState } from "react";
import { FaBold } from "react-icons/fa";
import { FiItalic, FiUnderline } from "react-icons/fi";
import { ImStrikethrough, ImLink } from "react-icons/im";
import { MdChecklist } from "react-icons/md";
import { List, ListOrdered, ListChecks } from "lucide-react";
import { genNodeId } from "@/hoc/withID";
import { ChangeBlocks } from "../ChangeBlocks";
import {
  isBlockActive,
  toggleBlock,
  isFormatActive,
  toggleFormat,
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

type ToolbarProps = {
  openLink: boolean;
  showMiniToolbar: boolean;
  setOpenLink: (value: boolean) => void;
  setShowMiniToolbar: (value: boolean) => void;
};

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

  const urlInputRef = useRef(null);

  const LIST_TYPES = ["numbered-list", "bulleted-list", "checked-list"];

  const getActiveLinkUrl = (editor) => {
    let linkUrl = "";
    for (const [node] of Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
    })) {
      if (node.url) {
        linkUrl = node.url;
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

  return (
    <div
      className="relative flex h-[36px] items-center focus:ring-2 focus:ring-black"
      style={{
        minWidth: 330,
        transition: "all 0.2s ease-in-out",
      }}
      tabIndex={-1}
      ref={toolbarRef}
    >
      <ChangeBlocks openLink={openLink} />
      <div className="h-full w-[1px] bg-gray-200 dark:bg-gray-700"></div>
      {!openLink && (
        <>
          <div className="flex  items-center p-1">
            <button
              className="flex h-[26px]  items-center  rounded-lg p-[5px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault();
                toggleFormat(editor, "bold");
              }}
            >
              <FaBold
                className={`${
                  isFormatActive(editor, "bold")
                    ? "text-brand"
                    : "text-darkblue dark:text-foreground"
                }`}
              />
            </button>
            <button
              className="ml-1 flex  h-[26px] items-center  rounded-lg p-[5px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault();
                toggleFormat(editor, "italic");
              }}
            >
              <FiItalic
                className={`${
                  isFormatActive(editor, "italic")
                    ? "text-brand"
                    : "text-darkblue dark:text-foreground"
                }`}
              />
            </button>
            <button
              className="ml-1 flex  h-[26px] items-center  rounded-lg p-[5px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault();
                toggleFormat(editor, "underline");
              }}
            >
              <FiUnderline
                className={`${
                  isFormatActive(editor, "underline")
                    ? "text-brand"
                    : "text-darkblue dark:text-foreground"
                }`}
              />
            </button>
            <button
              className="ml-1 flex h-[26px] items-center rounded-lg p-[5px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault();
                toggleFormat(editor, "strikethrough");
              }}
            >
              <ImStrikethrough
                className={`${
                  isFormatActive(editor, "strikethrough")
                    ? "text-brand"
                    : "text-darkblue dark:text-foreground"
                }`}
              />
            </button>
            <button
              className=" ml-1 flex h-[26px] items-center   rounded-lg p-[5px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted"
              onMouseDown={() => {
                setOpenLink(true);
              }}
            >
              <ImLink
                className={`${
                  hasURL ? "text-brand" : "text-darkblue dark:text-foreground"
                }`}
              />
            </button>
          </div>
          <div className="h-full w-[1px] bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex  items-center p-1">
            <button
              className="ml-1  flex  items-center justify-center  rounded-lg  p-[4px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault();
                toggleBlock(editor, "bulleted-list");
              }}
            >
              <List
                width={20}
                height={20}
                className={`h-[18px] w-[18px] ${
                  isBlockActive(editor, "bulleted-list", "type")
                    ? "text-brand"
                    : "text-darkblue dark:text-foreground"
                }`}
              />
            </button>
            <button
              className="ml-1  mr-1 flex   items-center justify-center rounded-lg  p-[4px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault();
                toggleBlock(editor, "numbered-list");
              }}
            >
              <ListOrdered
                width={20}
                height={20}
                className={`h-[18px] w-[18px] ${
                  isBlockActive(editor, "numbered-list", "type")
                    ? "text-brand"
                    : "text-darkblue dark:text-foreground"
                }`}
              />
            </button>
            <button
              className="ml-1  mr-1 flex   items-center justify-center rounded-lg  p-[4px] transition duration-300 hover:bg-gray-200 hover:dark:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault();
                toggleBlock(editor, "checked-list");
              }}
            >
              <MdChecklist
                width={20}
                height={20}
                className={`h-[18px] w-[18px] ${
                  isBlockActive(editor, "checked-list", "type")
                    ? "text-brand"
                    : "text-darkblue dark:text-foreground"
                }`}
              />
            </button>
          </div>
        </>
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
