import { EditorContext } from "@/contexts/EditorContext";
import { useContext, useEffect, useRef, useState } from "react";
import { FaBold } from "react-icons/fa";
import { FiItalic, FiUnderline } from "react-icons/fi";
import { ImStrikethrough, ImLink } from "react-icons/im";
import { ChevronDown, Type } from "lucide-react";
import { genNodeId } from "@/hoc/withID";
import Dropdown, { DropdownProvider } from "../Dropdown";
import { useArrowNavigation } from "@/hooks/useArrowNavigation";
import { FaCaretDown } from "react-icons/fa";
import {
  Editor,
  Transforms,
  Text,
  Range,
  Element as SlateElement,
} from "slate";
import { ReactEditor } from "slate-react";
import { useTheme } from "styled-components";

type ToolbarProps = {
  path: string;
};

export const MainToolbar: React.FC<ToolbarProps> = ({ path }) => {
  const { editor } = useContext(EditorContext);

  const theme = useTheme();

  const changeTextBlock = useRef(null);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false);

  const dropdownMenu = useRef(null);
  const TextBlockIcon = (
    <div className="flex items-center ">
      <Type color={theme.colors.darkblue} width={18} height={18} />
      <FaCaretDown className="w-4" color={theme.colors.darkblue} />
    </div>
  );

  const changeBlockElements = [
    {
      name: "Text",
      action: () => toggleBlock("Text"),
    },
    {
      name: "Heading 1",
      action: () => toggleBlock("Heading 1"),
    },
    {
      name: "Heading 2",
      action: () => toggleBlock("Heading 2"),
    },
    {
      name: "Heading 3",
      action: () => toggleBlock("Heading 3"),
    },
  ];

  function toggleBlock(format) {
    console.log(format);
    if (changeTextBlock.current) {
      changeTextBlock.current.handleClose();
    }
  }
  const { focusedIndex, setFocusedIndex, handleArrowNavigation } =
    useArrowNavigation(changeBlockElements, -1, () => {
      if (changeTextBlock.current) {
        changeTextBlock.current.handleClose();
      }
    });

  return (
    <div
      className="relative flex h-[40px] items-center"
      style={{
        width: 400,
        transition: "all 0.2s ease-in-out",
      }}
    >
      <>
        <div className="flex">
          {/* <button className="flex items-center  rounded-lg  p-2 transition duration-300 hover:bg-gray-200">
            
          </button> */}

          <DropdownProvider>
            <Dropdown
              dropdownId="changeBlockDropdown"
              ref={changeTextBlock}
              dropdownButtonClassName="px-1 py-0 flex items-center relative border-transparent outline-none border-0 shadow-none bg-transparent w-full h-[36px] justify-start transition-colors duration-300  focus:outline-none focus-within:ring-2 focus-within:ring-black focus-within:ring-opacity-40 hover:bg-gray-200"
              icon={TextBlockIcon}
              dropdownMenuNonPortalOverride="top-[38px]  border-black lg:absolute w-[200px]"
            >
              {/* <input
                ref={dropdownMenu}
                type="text"
                className="opacity- absolute h-[0px]"
              
              /> */}
              <div
                className="p-1"
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
                      className={`inline-flex w-full rounded-md px-4 py-2 text-left text-sm text-gray-700 transition duration-200 focus:outline-none
                        ${focusedIndex === index ? "bg-gray-200" : ""}
                        `}
                      role="menuitem"
                      tabIndex={-1}
                      id="menu-item-3"
                      onClick={element.action}
                    >
                      {element.name}
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
