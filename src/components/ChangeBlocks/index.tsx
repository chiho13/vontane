import { EditorContext } from "@/contexts/EditorContext";
import { SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { FaBold } from "react-icons/fa";
import { FiItalic, FiUnderline } from "react-icons/fi";
import { ImStrikethrough, ImLink } from "react-icons/im";
import { ChevronDown, Type, Heading1, Heading2, Heading3 } from "lucide-react";
import { genNodeId } from "@/hoc/withID";
import Dropdown, { DropdownProvider } from "../Dropdown";
import { useArrowNavigation } from "@/hooks/useArrowNavigation";
import { FaCaretDown } from "react-icons/fa";
import { TbBlockquote } from "react-icons/tb";
import {
  toggleBlock,
  isBlockActive,
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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ChangeBlocks = ({ openLink }: any) => {
  const { editor } = useContext(EditorContext);

  const theme = useTheme();

  const changeTextBlock = useRef<any>(null);

  const [isKeyboardNav, setIsKeyboardNav] = useState(false);

  const dropdownMenu = useRef(null);
  const changeBlockElements = [
    {
      name: "Text",
      format: "paragraph",
      action: () => toggleBlock(editor, "paragraph"),
      icon: (
        <Type
          className="stroke-darkblue dark:stroke-foreground"
          width={16}
          height={16}
        />
      ),
    },
    {
      name: "Heading 1",
      format: "heading-one",
      action: () => toggleBlock(editor, "heading-one"),
      icon: (
        <Heading1
          className="stroke-darkblue dark:stroke-foreground"
          width={18}
          height={18}
        />
      ),
    },
    {
      name: "Heading 2",
      format: "heading-two",
      action: () => toggleBlock(editor, "heading-two"),
      icon: (
        <Heading2
          className="stroke-darkblue dark:stroke-foreground"
          width={18}
          height={18}
        />
      ),
    },
    {
      name: "Heading 3",
      format: "heading-three",
      action: () => toggleBlock(editor, "heading-three"),
      icon: (
        <Heading3
          className="stroke-darkblue dark:stroke-foreground"
          width={18}
          height={18}
        />
      ),
    },
    {
      name: "Quote",
      format: "block-quote",
      action: () => toggleBlock(editor, "block-quote"),
      icon: (
        <TbBlockquote className="h-[18px] w-[18px] stroke-darkblue dark:stroke-foreground" />
      ),
    },
  ];
  const [selectedBlock, setSelectedBlock] = useState(0);

  useEffect(() => {
    if (!editor || !editor.selection) return;

    for (let i = 0; i < changeBlockElements.length; i++) {
      const element = changeBlockElements[i];
      if (element && isBlockActive(editor, element.format, "type")) {
        setSelectedBlock(i);
        break;
      }
    }
  }, [editor?.selection]);

  const selectedElement = changeBlockElements[selectedBlock];

  const TextBlockIcon = selectedElement ? (
    <div className="flex items-center ">
      {selectedElement.icon}
      <span className="ml-2 mr-2">{selectedElement.name}</span>
      <FaCaretDown className="w-4 stroke-darkblue dark:stroke-foreground" />
    </div>
  ) : null;

  const { focusedIndex, setFocusedIndex, handleArrowNavigation } =
    useArrowNavigation(
      changeBlockElements,
      -1,
      (index: SetStateAction<number>) => {
        if (changeTextBlock.current) {
          changeTextBlock.current.handleClose();
          setSelectedBlock(index);
        }
      }
    );

  useEffect(() => {
    if (openLink) {
      if (changeTextBlock.current) {
        changeTextBlock.current.handleClose();
      }
    }
  }, [openLink]);

  return (
    <div className="relative ml-1 flex h-[32px] items-center pr-1">
      <>
        <div className="flex">
          {/* <button className="flex items-center  rounded-lg  p-2 transition duration-300 hover:bg-gray-200">
            
          </button> */}

          <DropdownMenu>
            <DropdownMenuTrigger>
              <button
                className={` flex h-[28px]  items-center rounded-md   px-2 py-1 text-xs transition duration-300 hover:bg-gray-200 dark:text-white hover:dark:bg-accent `}
              >
                {TextBlockIcon}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-100 w-[200px] border-black dark:bg-secondary">
              <div className="p-2" role="none" tabIndex={-1}>
                {changeBlockElements.map((element, index) => (
                  <DropdownMenuItem
                    key={index}
                    onMouseOver={() => {
                      if (isKeyboardNav) return;
                      setFocusedIndex(index);
                    }}
                    className={`inline-flex w-full items-center rounded-md px-4 py-2 text-left text-sm font-semibold text-[#333333] text-darkblue transition duration-200 focus:outline-none dark:text-foreground ${
                      focusedIndex === index ? "bg-gray-200 dark:bg-accent" : ""
                    }`}
                    onSelect={() => {
                      element.action();
                      setSelectedBlock(index);
                      // Closing the dropdown needs to be handled by your context
                    }}
                  >
                    {element.icon}
                    <span className="ml-3">{element.name}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    </div>
  );
};
