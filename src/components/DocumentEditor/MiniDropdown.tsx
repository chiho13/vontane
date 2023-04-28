import { motion } from "framer-motion";
import { useTheme } from "styled-components";
import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { List, FileQuestion, CheckCircle } from "lucide-react";
import { EditorContext } from "@/contexts/EditorContext";
import { Editor } from "slate";
interface MiniDropdownProps {
  isOpen: boolean;
  addMCQBlock: () => void;
  addEquationBlock: () => void;
  genBlock: (value: string) => void;
  setShowDropdown: (value: boolean) => void;
  activePath: string;
  searchBarPosition: boolean;
}

export const MiniDropdown = forwardRef<HTMLDivElement, MiniDropdownProps>(
  (
    {
      isOpen,
      addMCQBlock,
      addEquationBlock,
      genBlock,
      setShowDropdown,
      activePath,
      searchBarPosition,
    },
    ref
  ) => {
    const theme = useTheme();
    const [search, setSearch] = useState("");
    const searchInputRef = useRef(null);

    const { editor } = useContext(EditorContext);
    const [currentNode] = Editor.node(editor, JSON.parse(activePath));
    const isEmpty =
      currentNode.children.length === 1 && currentNode.children[0].text === "";
    const customElements = [
      {
        name: "Add Quiz Block",
        action: addMCQBlock,
        icon: (
          <div className=" flex h-[60px] w-[60px] items-center justify-center rounded-md border">
            <CheckCircle color={theme.colors.darkergray} />
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

    useEffect(() => {
      if (isOpen) {
        searchInputRef.current.focus();
      }
    }, [isOpen]);

    const filterList = (list, searchText) => {
      if (!searchText || searchText.length === 0) {
        return list;
      }

      return list.filter((item) => {
        const itemName = item.name.toLowerCase();
        return itemName.includes(searchText.toLowerCase());
      });
    };

    console.log(search);
    const filteredList = filterList(customElements, search);

    return (
      <div className="relative">
        {!searchBarPosition && (
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="absolute -top-[50px] mb-2 w-full rounded-md border border-gray-500 bg-white px-2 py-1 outline-none focus:border-blue-500"
          />
        )}

        {searchBarPosition && (
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="absolute -bottom-[50px] mt-2 w-full rounded-md border border-gray-500 bg-white px-2 py-1 outline-none focus:border-blue-500"
          />
        )}
        <div
          ref={ref}
          className="dropdown-menu h-[360px] overflow-y-auto rounded-md border border-gray-200 bg-white p-2 shadow-md"
        >
          <ul>
            {filteredList.map((item, index) => (
              <li>
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.97 }}
                  className="mb-1 flex w-full items-center rounded-md border-2 border-gray-100 p-3 shadow-sm transition duration-300 hover:bg-gray-100"
                  onClick={item.action}
                >
                  {item.icon || item.image}
                  <span className="ml-4 ">{item.name}</span>
                </motion.button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);

MiniDropdown.displayName = "MiniDropdown";
