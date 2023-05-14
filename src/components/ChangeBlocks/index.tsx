import { EditorContext } from "@/contexts/EditorContext";
import { useContext, useEffect, useRef, useState } from "react";
import { FaBold } from "react-icons/fa";
import { FiItalic, FiUnderline } from "react-icons/fi";
import { ImStrikethrough, ImLink } from "react-icons/im";
import { ChevronDown, Type, Heading1, Heading2, Heading3 } from "lucide-react";
import { genNodeId } from "@/hoc/withID";
import Dropdown, { DropdownProvider } from "../Dropdown";
import { useArrowNavigation } from "@/hooks/useArrowNavigation";
import { FaCaretDown } from "react-icons/fa";
import { toggleBlock } from "../DocumentEditor/helpers/toggleBlock";
import {
  Editor,
  Transforms,
  Text,
  Range,
  Element as SlateElement,
} from "slate";
import { ReactEditor } from "slate-react";
import { useTheme } from "styled-components";

export const ChangeBlocks = () => {
  const { editor } = useContext(EditorContext);

  const theme = useTheme();

  const changeTextBlock = useRef(null);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);

  const dropdownMenu = useRef(null);
  const changeBlockElements = [
    {
      name: "Text",
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
      action: () => toggleBlock(editor, "heading-three"),
      icon: (
        <Heading3
          className="stroke-darkblue dark:stroke-foreground"
          width={18}
          height={18}
        />
      ),
    },
  ];
  const [selectedBlock, setSelectedBlock] = useState(0);

  const TextBlockIcon = (
    <div className="flex items-center ">
      {changeBlockElements[selectedBlock]["icon"]}
      <span className="ml-2 mr-2">
        {" "}
        {changeBlockElements[selectedBlock]["name"]}
      </span>
      <FaCaretDown className="w-4 stroke-darkblue dark:stroke-foreground" />
    </div>
  );

  const { focusedIndex, setFocusedIndex, handleArrowNavigation } =
    useArrowNavigation(changeBlockElements, -1, () => {
      if (changeTextBlock.current) {
        changeTextBlock.current.handleClose();
      }
    });

  return (
    <div className="relative ml-1 flex h-[32px] items-center pr-1">
      <>
        <div className="flex">
          {/* <button className="flex items-center  rounded-lg  p-2 transition duration-300 hover:bg-gray-200">
            
          </button> */}

          <DropdownProvider>
            <Dropdown
              dropdownId="changeBlockDropdown"
              ref={changeTextBlock}
              dropdownButtonClassName="p-1 px-2 flex text-darkblue items-center h-[32px] relative border outline-none border-0  dark:border-gray-700 shadow-none bg-transparent w-full  justify-start transition-colors duration-300  border focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-opacity-40 hover:bg-gray-200 dark:hover:bg-accent"
              icon={TextBlockIcon}
              dropdownMenuNonPortalOverride="top-[38px] -left-[5px] border-black dark:bg-background lg:absolute w-[200px]"
            >
              <div
                className="p-2"
                role="none"
                tabIndex={-1}
                onMouseLeave={() => {
                  setIsKeyboardNav(false);
                  setFocusedIndex(-1);
                }}
                onKeyDown={(e) => {
                  setIsKeyboardNav(true);
                  handleArrowNavigation(e);
                }}
              >
                {changeBlockElements.map((element, index) => {
                  return (
                    <button
                      onMouseOver={() => {
                        if (isKeyboardNav) return;
                        setFocusedIndex(index);
                      }}
                      className={`inline-flex w-full items-center rounded-md px-4 py-2 text-left text-sm font-semibold text-darkblue text-[#333333] transition duration-200 focus:outline-none dark:text-foreground
                        ${
                          focusedIndex === index
                            ? "bg-gray-200 dark:bg-accent"
                            : ""
                        }
                        `}
                      role="menuitem"
                      tabIndex={-1}
                      id="menu-item-3"
                      onClick={() => {
                        element.action();
                        setSelectedBlock(index);
                      }}
                    >
                      {element.icon}
                      <span className="ml-3">{element.name}</span>
                    </button>
                  );
                })}
              </div>
            </Dropdown>
          </DropdownProvider>
        </div>
      </>
    </div>
  );
};
