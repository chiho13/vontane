import { motion } from "framer-motion";
import { useTheme } from "styled-components";
import { forwardRef, useRef, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { MoreHorizontal, Trash2, Copy } from "lucide-react";
import { BsFillCaretDownFill } from "react-icons/bs";
import Dropdown, { DropdownContext, DropdownProvider } from "../Dropdown";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";
import { Editor, Path, Transforms } from "slate";
import { genNodeId } from "@/hoc/withID";
import { nanoid } from "nanoid";
import { useArrowNavigation } from "@/hooks/useArrowNavigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface OptionMenuProps {
  element: any;
}

export const OptionDropdown = forwardRef<HTMLDivElement, OptionMenuProps>(
  ({ element }, ref) => {
    const optionMenuRef = useRef(null);
    const { editor } = useContext(EditorContext);
    const { activeDropdown, toggleDropdown } = useContext(DropdownContext);

    const optionMenuElements = [
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
    ];
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
          className={`option-menu-container  relative -right-[5px] opacity-0 group-hover:opacity-100 ${
            activeDropdown === element.id && "opacity-100"
          }`}
          onMouseDown={(e) => {
            // prevent toolbar from taking focus away from editor

            e.preventDefault();
          }}
        >
          <Dropdown
            dropdownId={element.id}
            ref={ref}
            usePortal={true}
            dropdownButtonClassName=" p-0 border-transparent relative outline-none border-0 shadow-none bg-transparent w-full h-[26px] justify-start transition-colors duration-300 focus:ring-2 focus:ring-black focus:ring-opacity-30"
            dropdownMenuClassName=" top-0 w-[200px] border-0 dark:bg-secondary"
            icon={
              <div className="flex h-[22px] w-[22px] items-center  justify-center rounded-md bg-gray-200  p-0 hover:bg-gray-300 dark:bg-muted  dark:hover:bg-accent">
                <BsFillCaretDownFill className="option-menu w-[18px]  w-[18px] text-darkergray dark:text-muted-foreground" />
              </div>
            }
          >
            <div
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
              {optionMenuElements.map((item, index) => {
                if (item === "separator") {
                  // This is a separator. Render it as such.
                  return (
                    <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700"></div>
                  );
                }
                return (
                  <div className="p-1 " role="none">
                    <button
                      onClick={item.action}
                      className={`  flex  w-full items-center rounded-md px-4 py-1 text-left text-sm text-gray-700 transition duration-200 hover:text-gray-900 focus:outline-none dark:text-foreground   ${
                        focusedIndex === index
                          ? "bg-gray-200 dark:bg-muted"
                          : ""
                      }`}
                      role="menuitem"
                      tabIndex={-1}
                      id="menu-item-3"
                      onMouseOver={() => {
                        if (isKeyboardNav) return;
                        setFocusedIndex(index);
                      }}
                    >
                      <span>{item.icon}</span>

                      <span>{item.name}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </Dropdown>
        </div>
      </>
    );
  }
);
export const OptionMenu = forwardRef<HTMLDivElement, OptionMenuProps>(
  ({ element }, ref) => {
    return (
      <DropdownProvider>
        <OptionDropdown element={element} ref={ref} />
      </DropdownProvider>
    );
  }
);

OptionMenu.displayName = "OptionMenu";
