import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Filter {
  key: string;
  value: string;
}

interface FilterButtonProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
  filters: Filter[];
}

const mobile_filter_animation_props = {
  animate: {
    opacity: 1,
    height: 270,
  },
  initial: {
    opacity: 0,
    height: 0,
  },
  transition: {
    duration: 0.2,
  },
  enter: {
    opacity: 1,
    display: "block",
    height: 270,
    transition: {
      duration: 0.4,
    },
    transitionEnd: {
      display: "none",
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
    },
    transitionEnd: {
      display: "none",
    },
  },
};

const FilterButton: React.FC<FilterButtonProps> = ({
  filter,
  onFilterChange,
  filters,
}) => {
  const isSelected = filters.some(
    (f) => f.key === filter.key && f.value === filter.value
  );

  const className = `ml-2 box-border rounded-md border-2 bg-gray-100 px-4 py-1 text-sm font-medium text-gray-800 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50 ${
    isSelected ? "border-2 border-[#007AFF]" : ""
  }`;

  return (
    <button
      className={className}
      aria-label={filter.value}
      onClick={() => onFilterChange(filter)}
    >
      {filter.value}
    </button>
  );
};

interface MobileFilterDropdownProps {
  isOpenMobileFilterDropdown: boolean;
  filters: Filter[];
  onMobileFilterChange: (filter: Filter) => void;
  clearFilters: () => void;
  genders: Filter[];
  accents: Filter[];
  ages: Filter[];
  voiceStyles: Filter[];
}

const MobileFilterDropdown: React.FC<MobileFilterDropdownProps> = ({
  isOpenMobileFilterDropdown,
  filters,
  onMobileFilterChange,
  clearFilters,
  genders,
  accents,
  ages,
  voiceStyles,
}) => {
  return (
    <AnimatePresence>
      {isOpenMobileFilterDropdown && (
        <motion.div
          {...mobile_filter_animation_props}
          className="mobileFilters pt-6 shadow-sm"
        >
          {[
            { label: "Genders", items: genders },
            { label: "Accents", items: accents },
            { label: "Ages", items: ages },
            { label: "Styles", items: voiceStyles },
          ].map(({ label, items }) => (
            <div key={label} className="mobileFilters_container px-4 pb-8">
              <div className="mr-4 flex items-center">
                <span className="text-bold text-sm">{label}: </span>
                {items.map((item) => (
                  <FilterButton
                    key={item.value}
                    filter={item}
                    onFilterChange={onMobileFilterChange}
                    filters={filters}
                  />
                ))}
              </div>
            </div>
          ))}
          {filters.length > 0 && (
            <div className="absolute bottom-0 flex w-full justify-center p-4">
              <button
                className="justify-center bg-white px-2 text-[#007AFF] outline-none hover:bg-gray-50 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
                aria-label="Clear Filters"
                title="Click to clear all applied filters"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileFilterDropdown;
