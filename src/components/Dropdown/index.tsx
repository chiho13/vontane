import React, {
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  RefObject,
  ForwardedRef,
} from "react";
import { DropdownStyle } from "./style";
import useDropdown from "@/hooks/useDropdown";
import useClickOutsideHandler from "@/hooks/useClickOutside";

interface DropdownProps {
  id: string;
  selectedItemText?: any;
  children: React.ReactNode;
  icon?: React.ReactNode;
  image?: React.ReactNode;
  minHeight?: number;
}

export interface DropdownRef {
  handleClose: () => void;
  wrapperRef: React.RefObject<HTMLElement>;
}

function Dropdown(
  {
    id,
    selectedItemText = "",
    children,
    icon = null,
    image = null,
    minHeight = 0,
  }: DropdownProps,
  ref: ForwardedRef<DropdownRef>
) {
  const { isOpen, handleOpen, handleClose } = useDropdown();

  function handleVoicesDropdownClick(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  }

  const wrapperRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    handleClose,
    wrapperRef,
  }));

  // useClickOutsideHandler(wrapperRef, () => {
  //   handleClose();
  // });

  return (
    <>
      {isOpen && (
        <div
          className="closeOutside fixed top-0 left-0 h-full w-full opacity-50"
          onClick={handleClose}
        ></div>
      )}
      <DropdownStyle className="dropdown_wrapper">
        <button
          className="dropdown-toggle inline-flex items-center justify-center rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md shadow-sm outline-none hover:bg-gray-50 focus-visible:border-gray-400 "
          aria-expanded={isOpen}
          aria-haspopup="true"
          id="voices-dropdown"
          onClick={handleVoicesDropdownClick}
        >
          {image}
          <span className="dropdown_textbutton"> {selectedItemText}</span>
          {icon}
        </button>

        <div
          id={id}
          className={`dropdown-menu absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 ${
            isOpen ? "show" : ""
          }`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="voices-dropdown"
          tabIndex={-1}
        >
          {children}
        </div>
      </DropdownStyle>
    </>
  );
}

export default forwardRef(Dropdown);
