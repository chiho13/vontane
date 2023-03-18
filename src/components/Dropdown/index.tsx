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
import { motion, AnimatePresence, useCycle } from "framer-motion";

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

export const animation_props = {
  animate: {
    opacity: 1,
    y: 0,
  },
  initial: {
    opacity: 0,
    y: "-10px",
  },
  transition: {
    duration: 0.2,
  },
  enter: {
    opacity: 1,
    display: "block",
    transition: {
      duration: 0.6,
    },
    transitionEnd: {
      display: "none",
    },
  },
  exit: {
    opacity: 0,
    y: "-10px",
    transition: {
      duration: 0.2,
    },
    transitionEnd: {
      display: "none",
    },
  },
};

const clickoutside_props = {
  enter: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
    transitionEnd: {
      display: "block",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
    transitionEnd: {
      display: "none",
    },
  },
};

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
  // const [isOpen, toggleDropdown] = useCycle(false, true);
  function handleVoicesDropdownClick(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();
    // toggleDropdown();
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
      <AnimatePresence>
        {isOpen && (
          <motion.div {...clickoutside_props}>
            <div
              className="closeOutside fixed top-0 left-0 h-full w-screen opacity-50"
              onClick={handleClose}
            ></div>
          </motion.div>
        )}
      </AnimatePresence>
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
        <AnimatePresence>
          {isOpen && (
            <motion.div {...animation_props}>
              <div
                id={id}
                className="dropdown-menu absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="voices-dropdown"
                tabIndex={-1}
              >
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DropdownStyle>
    </>
  );
}

export default forwardRef(Dropdown);
