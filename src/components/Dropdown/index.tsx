import React, {
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  RefObject,
  ForwardedRef,
} from "react";
import { DropdownStyle } from "./style";
import useDropdown from "~/src/hooks/useDropdown";
import useClickOutsideHandler from "~/src/hooks/useClickOutside";

interface DropdownProps {
  id: string;
  selectedItemText: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  minHeight?: number;
}

export interface DropdownRef {
  handleClose: () => void;
  wrapperRef: React.RefObject<HTMLElement>;
}

function Dropdown(
  { id, selectedItemText, children, icon, minHeight = 0 }: DropdownProps,
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
      {isOpen && <div className="closeOutside" onClick={handleClose}></div>}
      <DropdownStyle>
        <button
          className="dropdown-toggle inline-flex justify-center rounded-md shadow-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50 focus-visible:outline-none"
          aria-expanded={isOpen}
          aria-haspopup="true"
          id="voices-dropdown"
          onClick={handleVoicesDropdownClick}
        >
          <span> {selectedItemText}</span>
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
