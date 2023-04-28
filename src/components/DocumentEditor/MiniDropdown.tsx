import { motion } from "framer-motion";
import { useTheme } from "styled-components";
import { forwardRef } from "react";
import Image from "next/image";
import { List, FileQuestion, CheckCircle } from "lucide-react";

interface MiniDropdownProps {
  isOpen: boolean;
  addMCQBlock: () => void;
  addEquationBlock: () => void;
  genBlock: (value: string) => void;
  searchText: string;
}

export const MiniDropdown = forwardRef<HTMLDivElement, MiniDropdownProps>(
  ({ isOpen, addMCQBlock, addEquationBlock, genBlock, searchText }, ref) => {
    const theme = useTheme();

    const customElements = [
      {
        name: "Add Quiz Block",
        action: addMCQBlock,
        icon: (
          <div className=" flex h-[60px] w-[60px] items-center justify-center rounded-md border">
            <CheckCircle color={theme.colors.darkergray} />)
          </div>
        ),
      },
      {
        name: "English MCQ",
        action: () => genBlock("english"),
        icon: (
          <div className=" flex h-[60px] w-[60px] items-center justify-center rounded-md border">
            <List color={theme.colors.darkergray} />
            <FileQuestion color={theme.colors.darkergray} />
          </div>
        ),
      },
      {
        name: "Math Questions",
        action: () => genBlock("math"),
        image: (
          <Image
            src="/images/math.png"
            alt="add latex block equation"
            width={60}
            height={60}
            className="rounded-md border"
          />
        ),
      },
      {
        name: "Add Block Equation",
        action: addEquationBlock,
        image: (
          <Image
            src="/images/tex.png"
            alt="add latex block equation"
            width={60}
            height={60}
            className="rounded-md border"
          />
        ),
      },
    ];

    const filterList = (list, searchText) => {
      if (!searchText || searchText.length === 0) {
        return list;
      }

      return list.filter((item) => {
        const itemName = item.name.toLowerCase();
        return itemName.includes(searchText.toLowerCase());
      });
    };

    console.log(searchText);
    const filteredList = filterList(customElements, searchText);

    return (
      <div
        ref={ref}
        className="dropdown-menu h-[360px] overflow-y-auto rounded-md border border-gray-200 bg-white p-2 shadow-md"
      >
        <ul>
          {filteredList.map((item, index) => (
            <motion.li
              key={index}
              whileTap={{ scale: 0.97 }}
              className="mb-1 flex w-full items-center rounded-md border-2 border-gray-100 p-3 shadow-sm transition duration-300 hover:bg-gray-100"
              onClick={item.action}
            >
              {item.icon || item.image}
              <span className="ml-4 ">{item.name}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    );
  }
);

MiniDropdown.displayName = "MiniDropdown";
