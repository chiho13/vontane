import { motion } from "framer-motion";
import { useTheme } from "styled-components";
import { forwardRef, useRef, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Trash2, Copy } from "lucide-react";
import { BsFillCaretDownFill, BsSoundwave } from "react-icons/bs";
import Dropdown, { DropdownContext, DropdownProvider } from "../Dropdown";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";
import { Element as SlateElement, Editor, Path, Transforms } from "slate";
import { genNodeId } from "@/hoc/withID";
import { nanoid } from "nanoid";
import { useArrowNavigation } from "@/hooks/useArrowNavigation";
import { wrapElementWithTTS } from "./helpers/toggleBlock";
// import { isParentTTS, wrapWithTTS } from "./helpers/toggleBlock";

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

const isParentTTS = (editor, node) => {
  const path = ReactEditor.findPath(editor, node);
  const parent = Editor.parent(editor, path);

  return (
    parent && SlateElement.isElement(parent[0]) && parent[0].type === "tts"
  );
};

interface OptionMenuProps {
  element: any;
}

interface OptionMenuElement {
  name: string;
  action: (event: React.MouseEvent) => void;
  icon: React.ReactElement;
}

export const OptionDropdown = forwardRef<HTMLDivElement, OptionMenuProps>(
  ({ element }, ref) => {
    const optionMenuRef = useRef(null);
    const { editor } = useContext(EditorContext);
    const { activeDropdown, toggleDropdown } = useContext(DropdownContext);

    let optionMenuElements: any = [
      {
        name: "Text to MP3",
        action: () => wrapElementWithTTS(editor, element),
        icon: (
          <BsSoundwave className="mr-4 w-5  stroke-darkergray dark:stroke-foreground" />
        ),
      },
      {
        name: "Duplicate",
        action: duplicateBlock,
        icon: (
          <Copy className="mr-4 w-5  stroke-darkergray dark:stroke-foreground" />
        ),
      },

      "separator",
      {
        name: "Delete",
        action: deleteBlock,
        icon: (
          <Trash2 className="mr-4 w-5  stroke-darkergray dark:stroke-foreground" />
        ),
      },
    ].filter((item) => {
      if (typeof item === "string") {
        // item is a separator, we don't need to do any action here
        return true;
      } else {
        // Exclude "Duplicate" option if element type is "tts"
        if (element.type === "tts" && item.name === "Duplicate") {
          return false;
        }

        if (item.name === "Text to MP3") {
          if (
            element.type === "tts" ||
            element.type === "slide" ||
            element.type === "image" ||
            isParentTTS(editor, element)
          ) {
            return false;
          }
        }
      }
      // Otherwise, include the option
      return true;
    });

    const actionableItems = optionMenuElements.filter(
      (item) => item !== "separator"
    );
    if (actionableItems.length === 1) {
      optionMenuElements = actionableItems;
    }

    const [isKeyboardNav, setIsKeyboardNav] = useState(false);

    const actionableOptionMenuElements = optionMenuElements.filter(
      (item) => item !== "separator"
    );

    const { focusedIndex, setFocusedIndex, handleArrowNavigation } =
      useArrowNavigation(optionMenuElements, -1, () => {
        toggleDropdown(null);
      });

    function deleteBlock(event: React.MouseEvent<HTMLButtonElement>) {
      //   onClick();

      console.log("delete block");
      ReactEditor.focus(editor);

      // Delete the current element
      Transforms.removeNodes(editor, {
        at: ReactEditor.findPath(editor, element),
      });
    }

    function duplicateBlock(event: React.MouseEvent<HTMLButtonElement>) {
      // Get the path to the current block
      const path = ReactEditor.findPath(editor, element);

      // Get the current block
      const [node] = Editor.node(editor, path);

      // Duplicate the current block
      const newNode = { ...node, id: genNodeId() };

      // Insert the new block immediately after the current block
      Transforms.insertNodes(editor, newNode, { at: Path.next(path) });
      toggleDropdown("");
    }

    return (
      <>
        <div
          className={`option-menu-container relative top-1  ${
            activeDropdown === element.id && "opacity-100"
          }`}
          onMouseDown={(e) => {
            // prevent toolbar from taking focus away from editor

            e.preventDefault();
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-gray-200 p-0 hover:bg-gray-300 dark:bg-muted dark:hover:bg-accent">
                <MoreHorizontal className="option-menu w-[18px] w-[18px] text-darkergray dark:text-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className=" top-0 w-[200px] border dark:border-accent dark:bg-muted">
              {optionMenuElements.map((item, index) => {
                if (typeof item === "string") {
                  // This is a separator. Render it as such.
                  return (
                    <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700"></div>
                  );
                } else {
                  return (
                    <DropdownMenuItem
                      key={index}
                      onClick={item.action}
                      className={`flex w-full items-center rounded-sm px-4 py-2 text-left text-sm text-gray-700 transition duration-200 hover:text-gray-900 focus:outline-none dark:text-foreground ${
                        focusedIndex === index
                          ? "bg-gray-200 dark:bg-accent"
                          : ""
                      }`}
                      onMouseOver={() => {
                        if (isKeyboardNav) return;
                        setFocusedIndex(index);
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </DropdownMenuItem>
                  );
                }
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  }
);
export const OptionMenu = forwardRef<HTMLDivElement, OptionMenuProps>(
  ({ element }, ref) => {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger>
            <OptionDropdown element={element} ref={ref} />
          </TooltipTrigger>
          <TooltipContent
            className="border-black  dark:bg-white dark:text-muted"
            side="top"
            sideOffset={10}
          >
            <p className="text-[12px]">Actions</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

OptionMenu.displayName = "OptionMenu";
