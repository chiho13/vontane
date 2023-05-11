import { EditorContext } from "@/contexts/EditorContext";
import { useContext, useEffect, useRef, useState } from "react";
import { FaBold } from "react-icons/fa";
import { FiItalic, FiUnderline } from "react-icons/fi";
import { ImStrikethrough, ImLink } from "react-icons/im";
import { ChevronDown, Type } from "lucide-react";
import { genNodeId } from "@/hoc/withID";
import Dropdown, { DropdownProvider } from "../Dropdown";
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
  const dropdownMenu = useRef(null);
  const TextBlockIcon = (
    <div className="flex">
      <Type color={theme.colors.darkblue} />
      <ChevronDown className="w-4" color={theme.colors.darkgray} />
    </div>
  );

  const changeBlockElements = [
    {
      name: "Heading 1",
      action: () => toggleBlock("Heading 1"),
    },
    {
      name: "Heading 2",
      action: () => toggleBlock("Heading 2"),
    },
  ];

  function toggleBlock(format) {
    console.log(format);
    if (changeTextBlock.current) {
      changeTextBlock.current.handleClose();
    }
  }
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleArrowNavigation = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((prevIndex) =>
        Math.min(prevIndex + 1, changeBlockElements.length - 1)
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (event.key === "Tab") {
      event.preventDefault();
      if (event.shiftKey) {
        setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else {
        setFocusedIndex((prevIndex) =>
          Math.min(prevIndex + 1, changeBlockElements.length - 1)
        );
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (changeBlockElements[focusedIndex]) {
        changeBlockElements[focusedIndex].action();
      }
    }
  };

  return (
    <div
      className="relative flex h-[40px] items-center"
      style={{
        width: 400,
        transition: "all 0.2s ease-in-out",
      }}
    >
      <>
        <div className="flex  p-1">
          {/* <button className="flex items-center  rounded-lg  p-2 transition duration-300 hover:bg-gray-200">
            
          </button> */}

          <DropdownProvider>
            <Dropdown
              dropdownId="changeBlockDropdown"
              ref={changeTextBlock}
              dropdownButtonClassName="px-2 relative border-transparent outline-none border-0 shadow-none bg-transparent w-full h-[47px] justify-start transition-colors duration-300 focus:ring-2 focus:ring-black focus:ring-opacity-30 hover:bg-gray-200"
              icon={TextBlockIcon}
              dropdownMenuNonPortalOverride="lg:absolute w-[200px]"
              callback={(isOpen) => {
                if (isOpen) {
                  dropdownMenu.current.focus();
                }
              }}
            >
              <input
                ref={dropdownMenu}
                type="text"
                className="opacity- absolute h-[0px]"
                onKeyDown={(e) => {
                  handleArrowNavigation(e);
                }}
              />
              <div className="p-1" role="none" tabIndex={-1}>
                {changeBlockElements.map((element, index) => {
                  return (
                    <button
                      className={`inline-flex w-full rounded-md px-4 py-2 text-left text-sm text-gray-700 hover:text-gray-900
                        ${
                          focusedIndex === index
                            ? "bg-gray-200"
                            : "hover:bg-gray-200"
                        }
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
