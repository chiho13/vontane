import React, {
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  RefObject,
  createContext,
  ForwardedRef,
  useState,
  useContext,
} from "react";
import { DropdownStyle } from "./style";
import useDropdown from "@/hooks/useDropdown";
import useClickOutside from "@/hooks/useClickOutside";
import { motion, AnimatePresence, useCycle } from "framer-motion";

export interface DropdownContextType {
  activeDropdown: string | null;
  toggleDropdown: (dropdownId: string | null) => void;
}

export const DropdownContext = createContext<DropdownContextType>({
  activeDropdown: null,
  toggleDropdown: () => {},
});

interface DropdownProviderProps {
  children: React.ReactNode;
}

export const DropdownProvider: React.FC<DropdownProviderProps> = ({
  children,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  function toggleDropdown(value: React.SetStateAction<string | null>) {
    setActiveDropdown(value);
  }

  return (
    <DropdownContext.Provider value={{ activeDropdown, toggleDropdown }}>
      {children}
    </DropdownContext.Provider>
  );
};

interface DropdownProps {
  dropdownId: string;
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
    dropdownId,
    selectedItemText = "",
    children,
    icon = null,
    image = null,
    minHeight = 0,
  }: DropdownProps,
  ref: ForwardedRef<DropdownRef>
) {
  // const { isOpen, handleOpen, handleClose } = useDropdown();
  const { activeDropdown, toggleDropdown } = useContext(DropdownContext);
  const isOpen = activeDropdown === dropdownId;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleVoicesDropdownClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    console.log(wrapperRef);
    if (activeDropdown === dropdownId) {
      toggleDropdown(null);
    } else {
      toggleDropdown(dropdownId);
    }
  };

  const handleClose = () => {
    toggleDropdown(null);
  };

  const toggleRef = useRef<HTMLButtonElement>(null);

  useClickOutside(
    wrapperRef,
    () => {
      if (isOpen) {
        toggleDropdown(null);
      }
    },
    toggleRef
  );

  // const handleClick = (e: MouseEvent) => {
  //   if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
  //     handleClose();
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener("mousedown", handleClick);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClick);
  //   };
  // }, [ref, handleClose]);

  useImperativeHandle(ref, () => ({
    handleClose,
    wrapperRef,
  }));

  return (
    <>
      <AnimatePresence>
        {activeDropdown === dropdownId && (
          <motion.div {...clickoutside_props}>
            <div
              className="closeOutside fixed top-0 left-0 h-full w-screen opacity-50"
              // onClick={handleClose}
            ></div>
          </motion.div>
        )}
      </AnimatePresence>
      <DropdownStyle className="dropdown_wrapper">
        <button
          type="button"
          className="dropdown-toggle inline-flex items-center justify-center rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md shadow-sm outline-none hover:bg-gray-50 focus-visible:border-gray-400 "
          aria-expanded={isOpen}
          aria-haspopup="true"
          id="voices-dropdown"
          onClick={handleVoicesDropdownClick}
          ref={toggleRef}
        >
          {image}
          <span className="dropdown_textbutton"> {selectedItemText}</span>
          {icon}
        </button>
        <AnimatePresence>
          {activeDropdown === dropdownId && (
            <motion.div {...animation_props}>
              <div
                id={dropdownId}
                className="dropdown-menu absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="voices-dropdown"
                tabIndex={-1}
                ref={wrapperRef}
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
