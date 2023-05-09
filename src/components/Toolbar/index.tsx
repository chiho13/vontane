import { EditorContext } from "@/contexts/EditorContext";
import { useContext, useEffect, useRef, useState } from "react";
import { FaBold } from "react-icons/fa";
import { FiItalic, FiUnderline } from "react-icons/fi";
import { ImStrikethrough, ImLink } from "react-icons/im";
import { genNodeId } from "@/hoc/withID";
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
  path: string;
  setToolbarWidth: (value: number) => void;
  openLink: boolean;
  setOpenLink: (value: boolean) => void;
  lastActiveSelection: any;
  setShowMiniToolbar: (value: boolean) => void;
};

export const Toolbar: React.FC<ToolbarProps> = ({
  path,
  setToolbarWidth,
  openLink,
  setOpenLink,
  lastActiveSelection,
  setShowMiniToolbar,
}) => {
  const { editor } = useContext(EditorContext);

  const { isInline } = editor;

  editor.isInline = (element) =>
    ["link"].includes(element.type) || isInline(element);

  const theme = useTheme();
  const [inputValue, setInputValue] = useState("");

  //   editor.selection = lastActiveSelection;
  const urlInputRef = useRef(null);

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

  const toggleFormat = (editor: ReactEditor, format: string) => {
    const isFormatActive = (editor, format) => {
      const [match] = Editor.nodes(editor, {
        match: (n) => n[format] === true,
        mode: "all",
      });
      return !!match;
    };
    const isActive = isFormatActive(editor, format);
    Transforms.setNodes(
      editor,
      { [format]: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  };

  return (
    <div
      className="relative flex h-[38px] items-center px-1"
      style={{
        width: 400,
        transition: "all 0.2s ease-in-out",
      }}
    >
      {!openLink && (
        <>
          <button
            className="rounded-lg p-2 transition duration-300 hover:bg-gray-200"
            onClick={() => toggleFormat(editor, "bold")}
          >
            <FaBold color={theme.colors.darkblue} />
          </button>
          <button
            className="rounded-lg p-2 transition duration-300 hover:bg-gray-200"
            onClick={() => toggleFormat(editor, "italic")}
          >
            <FiItalic color={theme.colors.darkblue} />
          </button>
          <button
            className="rounded-lg p-2 transition duration-300 hover:bg-gray-200"
            onClick={() => toggleFormat(editor, "underline")}
          >
            <FiUnderline color={theme.colors.darkblue} />
          </button>
          <button
            className="rounded-lg p-2 transition duration-300 hover:bg-gray-200"
            onClick={() => toggleFormat(editor, "strikethrough")}
          >
            <ImStrikethrough color={theme.colors.darkblue} />
          </button>
          <button
            className="rounded-lg p-2 transition duration-300 hover:bg-gray-200"
            onClick={() => {
              setOpenLink(true);
            }}
          >
            <ImLink color={theme.colors.darkblue} />
          </button>
        </>
      )}

      {openLink && (
        <div className=" absolute left-0  flex w-full items-center bg-white">
          {/* <button className="p-1">
            <X color={theme.colors.darkgray} />
          </button> */}
          <form onSubmit={handleSubmit} className="flex w-full">
            <input
              ref={urlInputRef}
              className=" h-[34px] w-[75%] rounded border border-gray-400 px-1 focus:border-[#007AFF] focus:outline-none "
              value={inputValue}
              placeholder="Enter URL"
              onChange={handleInputChange}
              onBlur={(e) => e.preventDefault()}
            />
            <button
              className={`grow p-1 text-sm font-semibold text-[${theme.colors.brand}]`}
              type="submit"
            >
              Apply
            </button>
          </form>
          {hasURL && (
            <button
              className={`grow p-1 pr-2 text-sm font-semibold text-[${theme.colors.brand}]`}
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
