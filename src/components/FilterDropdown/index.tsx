import React, {
  useState,
  useEffect,
  forwardRef,
  RefObject,
  ForwardedRef,
  useImperativeHandle,
  lazy,
  useRef,
  Suspense,
} from "react";
import Dropdown from "../Dropdown";
import { FilterDropdownStyle } from "./style";
import FilterIcon from "../../icons/FilterIcon";
import useClickOutside from "../../hooks/useClickOutside";
import { flags } from "../../icons/flags";
import { AnimatePresence, motion } from "framer-motion";
import { y_animation_props } from "../Dropdown";
import Image from "next/image";

interface FilterProps {
  id: string;
  options: { key: string; value: string };
  onChange: (option: { value: string }) => void;
  defaultTitle: string;
  isOpen?: boolean;
  setActiveFilter: any;
}

interface FlagProps {
  name: string;
}

function Filter(
  {
    id,
    options,
    onChange,
    defaultTitle,
    isOpen = false,
    setActiveFilter,
  }: FilterProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [selectedOption, setSelectedOption] = useState(defaultTitle);

  // const { ref, isOpen, handleOpen, handleClose } = useMultiDropdown();
  function handleOptionChange(option: { value: string }) {
    if (option.value === "All") {
      // setSelectedOption(defaultTitle);
      onChange({ value: "All" });
      return;
    }
    // setSelectedOption(option.value);
    onChange(option);
  }

  function handleVoicesDropdownClick(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();
    setActiveFilter((prevState: string) => (prevState === id ? "" : id));
  }

  const wrapperRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useClickOutside(
    wrapperRef,
    () => {
      if (isOpen) {
        setActiveFilter("");
      }
    },
    toggleRef
  );

  return (
    <FilterDropdownStyle>
      <div>
        <button
          className="dropdown-toggle inline-flex justify-center rounded-md border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm outline-none hover:bg-gray-50 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
          aria-expanded={isOpen}
          aria-haspopup="true"
          id="filter-dropdown"
          onClick={handleVoicesDropdownClick}
          ref={toggleRef}
        >
          <span className="text-sm sm:text-base"> {defaultTitle}</span>
          <FilterIcon />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div {...y_animation_props}>
            <div
              id={id}
              className="dropdown-menu absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="voices-dropdown"
              tabIndex={-1}
              ref={wrapperRef}
            >
              <ul
                className="filterDropdown_list py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownDefaultButton"
              >
                {options.map((option) => (
                  <li key={option.value}>
                    <a
                      href="#"
                      className="filter_optionItems block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={(e) => {
                        handleOptionChange(option);
                      }}
                    >
                      <span className="flex items-center text-sm sm:text-base">
                        {option.key === "accent" && (
                          <Image
                            src={flags[option.value]}
                            width="24"
                            height="24"
                            alt={option.value}
                          />
                        )}
                        {option.value}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </FilterDropdownStyle>
  );
}
export default forwardRef<HTMLDivElement, FilterProps>(Filter);
