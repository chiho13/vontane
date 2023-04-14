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
import useClickOutside from "@/hooks/useClickOutside";
import { motion, AnimatePresence, useCycle } from "framer-motion";
import { mq, breakpoints } from "@/utils/breakpoints";
import { Portal } from "react-portal";

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
  dropdownButtonClassName?: string;
  dropdownMenuClassName?: string;
  minHeight?: number;
  usePortal?: boolean;
  callback?: (event) => void;
}

export interface DropdownRef {
  handleClose: () => void;
  wrapperRef: React.RefObject<HTMLElement>;
}

export const y_animation_props = {
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

const slide_up_animation_props = {
  animate: {
    opacity: 1,
    y: 0,
  },
  initial: {
    opacity: 0,
    y: "100%",
    zIndex: 1000,
  },
  transition: {
    duration: 0.2,
  },
  enter: {
    opacity: 1,
    y: 0,
    zIndex: 1000,
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
    y: "100%",
    zIndex: 1000,
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
    dropdownButtonClassName,
    dropdownMenuClassName,
    minHeight = 0,
    usePortal = false,
  }: DropdownProps,
  ref: ForwardedRef<DropdownRef>
) {
  const { activeDropdown, toggleDropdown } = useContext(DropdownContext);

  const [buttonPosition, setButtonPosition] = useState<{
    top: number;
    right: number;
  }>({ top: 0, right: 0 });

  const isOpen = activeDropdown === dropdownId;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const desktopbreakpoint = window.screen.width > breakpoints.lg;

  const animation_props = desktopbreakpoint
    ? y_animation_props
    : slide_up_animation_props;

  const updateButtonPosition = () => {
    if (toggleRef.current) {
      const rect = toggleRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.top + window.scrollY + rect.height + 10,
        right: window.innerWidth - (rect.left + rect.width + 80),
      });
    }
  };

  const handleDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    updateButtonPosition();

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

  useImperativeHandle(ref, () => ({
    handleClose,
    wrapperRef,
  }));

  const dropdownButtonStyleOverride =
    dropdownButtonClassName ||
    " border-2 border-gray-300 bg-white px-4 py-2 shadow-md shadow-sm outline-none hover:bg-gray-50 focus-visible:border-gray-400";

  const dropdownMenuStyleOverride =
    dropdownMenuClassName || "fixed left-0  top-12 mt-2 w-full";
  return (
    <>
      {desktopbreakpoint && (
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
      )}
      <DropdownStyle className="dropdown_wrapper relative flex justify-end">
        <button
          type="button"
          className={`dropdown-toggle inline-flex items-center rounded-md text-sm font-medium text-gray-700 ${dropdownButtonStyleOverride}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
          id="dropdown"
          onClick={handleDropdownClick}
          ref={toggleRef}
        >
          {image}
          <span className="dropdown_textbutton"> {selectedItemText}</span>
          {icon}
        </button>
        <AnimatePresence>
          {activeDropdown === dropdownId &&
            (usePortal ? (
              <Portal>
                <motion.div
                  {...animation_props}
                  id={dropdownId}
                  className={`dropdown-menu z-10000 min-w-[100px] origin-top-right border-2 bg-white shadow-lg ring-1 ring-black ring-opacity-5 lg:absolute lg:rounded-md ${dropdownMenuStyleOverride}`}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="voices-dropdown"
                  tabIndex={-1}
                  ref={wrapperRef}
                  style={{
                    top: buttonPosition.top,
                    right: buttonPosition.right,
                  }}
                >
                  {children}
                </motion.div>
              </Portal>
            ) : (
              <motion.div
                {...animation_props}
                id={dropdownId}
                className="dropdown-menu z-10000 fixed left-0  top-12 mt-2 w-full min-w-[100px] origin-top-right border-2 bg-white shadow-lg ring-1 ring-black ring-opacity-5 lg:absolute lg:rounded-md"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="voices-dropdown"
                tabIndex={-1}
                ref={wrapperRef}
              >
                {children}
              </motion.div>
            ))}
        </AnimatePresence>
      </DropdownStyle>
    </>
  );
}

export default forwardRef(Dropdown);
