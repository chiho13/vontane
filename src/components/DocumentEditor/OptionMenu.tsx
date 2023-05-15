import { motion } from "framer-motion";
import { useTheme } from "styled-components";
import { forwardRef, useRef, useContext, useEffect } from "react";
import Image from "next/image";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { BsFillCaretDownFill } from "react-icons/bs";
import Dropdown, { DropdownContext, DropdownProvider } from "../Dropdown";
import { EditorContext } from "@/contexts/EditorContext";
import { ReactEditor } from "slate-react";
import { Transforms } from "slate";

interface OptionMenuProps {
  element: any;
}

export const OptionDropdown = forwardRef<HTMLDivElement, OptionMenuProps>(
  ({ element }, ref) => {
    const optionMenuRef = useRef(null);
    const { editor } = useContext(EditorContext);
    const { activeDropdown, toggleDropdown } = useContext(DropdownContext);

    const deleteBlock = (event: React.MouseEvent<HTMLButtonElement>) => {
      //   onClick();
      event.preventDefault();
      event.stopPropagation();
      console.log("delete block");
      ReactEditor.focus(editor);

      // Delete the current element
      Transforms.removeNodes(editor, {
        at: ReactEditor.findPath(editor, element),
      });
    };

    return (
      <>
        <div
          className={`option-menu-container opacity-0 group-hover:opacity-100 ${
            activeDropdown === element.id && "opacity-100"
          }`}
        >
          <Dropdown
            dropdownId={element.id}
            ref={ref}
            usePortal={true}
            dropdownButtonClassName=" p-0 border-transparent relative outline-none border-0 shadow-none bg-transparent w-full h-[26px] justify-start transition-colors duration-300 focus:ring-2 focus:ring-black focus:ring-opacity-30 dark:border dark:border-gray-700"
            dropdownMenuClassName=" top-0 w-[200px] border-0"
            icon={
              <div className="flex h-[22px] w-[22px] items-center  justify-center rounded-md bg-gray-200  p-0 hover:bg-gray-300 dark:bg-muted dark:hover:bg-accent">
                <BsFillCaretDownFill className="option-menu w-[18px]  w-[18px] stroke-darkergray dark:stroke-muted-foreground" />
              </div>
            }
          >
            <div className="p-1 " role="none">
              <button
                onClick={deleteBlock}
                className="  flex  w-full items-center rounded-md px-4 py-2 text-left text-sm text-gray-700  hover:bg-gray-100 hover:text-gray-900 dark:text-foreground dark:hover:bg-accent"
                role="menuitem"
                tabIndex={-1}
                id="menu-item-3"
              >
                <Trash2 className="mr-4 w-5  stroke-darkergray dark:stroke-foreground" />
                Delete
              </button>
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
