import { motion } from "framer-motion";
import { useTheme } from "styled-components";
import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { List, FileQuestion, CheckCircle } from "lucide-react";
import { EditorContext } from "@/contexts/EditorContext";
import { Editor, Path, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { TextIcon } from "@/icons/Text";
import { SlideBreak } from "@/icons/SlideBreak";
import { addSlideBreak } from "./helpers/addSlideBreak";
import { genNodeId } from "@/hoc/withID";
import { useArrowNavigation } from "@/hooks/useArrowNavigation";

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
    const [isKeyboardNav, setIsKeyboardNav] = useState(false);
    const isEmpty =
      currentNode.children.length === 1 && currentNode.children[0].text === "";
    const customElements = [
      {
        name: "Text",
        description: "Just start writing",
        action: closeDropdown,
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 p-1">
            <TextIcon strokeColor={theme.colors.darkergray} />
          </div>
        ),
      },
      {
        name: "Slide Break",
        description: "Slide mode: break the page",
        action: addSlideBreakHandler,
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 p-1">
            <SlideBreak strokeColor={theme.colors.darkergray} />
          </div>
        ),
      },
      {
        name: "Add Quiz Block",
        description: "Set a multiple choice question",
        action: addMCQBlock,
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 p-1">
            <CheckCircle color={theme.colors.darkergray} />
          </div>
        ),
      },
      // {
      //   name: "English MCQ",
      //   description: "English multiple choice question",
      //   action: () => genBlock("english"),
      //   icon: (
      //     <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border  border-gray-300 p-1">
      //       <List color={theme.colors.darkergray} />
      //       <FileQuestion color={theme.colors.darkergray} />
      //     </div>
      //   ),
      // },
      // {
      //   name: "Math Questions",
      //   description: "Math question with equation block",
      //   action: () => genBlock("math"),
      //   image: (
      //     <Image
      //       src="/images/math.png"
      //       alt="add latex block equation"
      //       width={44}
      //       height={44}
      //       className="rounded-md border border-gray-300 p-1"
      //     />
      //   ),
      // },
      {
        name: "Add Block Equation",
        description: "Display standalone equation block",
        action: addEquationBlock,
        image: (
          <Image
            src="/images/tex.png"
            alt="add latex block equation"
            width={44}
            height={44}
            className="rounded-md border  border-gray-300 p-1"
          />
        ),
      },
    ];

    const { focusedIndex, setFocusedIndex, handleArrowNavigation } =
      useArrowNavigation(customElements, 0, closeDropdown);

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

    const closeOnEmptyInput = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Backspace") {
        if (search.length === 0) {
          event.preventDefault();
          closeDropdown();
        }
      }
    };

    function closeDropdown() {
      setShowDropdown(false);

      Transforms.select(editor, Editor.start(editor, JSON.parse(activePath)));

      ReactEditor.focus(editor);

      if (currentNode.type !== "paragraph") {
        const newNode = {
          id: genNodeId(),
          type: "paragraph",
          children: [{ text: "" }],
        };

        Transforms.insertNodes(editor, newNode, {
          at: Path.next(JSON.parse(activePath)),
        });
        Transforms.select(
          editor,
          Editor.start(editor, Path.next(JSON.parse(activePath)))
        );
      }
    }

    function addSlideBreakHandler() {
      console.log("add slide break");
      addSlideBreak(editor, JSON.parse(activePath));
      setShowDropdown(false);
      Transforms.select(
        editor,
        Editor.start(editor, Path.next(JSON.parse(activePath)))
      );

      ReactEditor.focus(editor);
    }

    return (
      <div className="relative" ref={ref}>
        {!searchBarPosition && (
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              closeOnEmptyInput(e);
              setIsKeyboardNav(true);
              handleArrowNavigation(e);
            }}
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
            onKeyDown={(e) => {
              closeOnEmptyInput(e);
              handleArrowNavigation(e);
            }}
            placeholder="Search"
            className="absolute -bottom-[50px] mt-2 w-full rounded-md border border-gray-500 bg-white px-2 py-1 outline-none focus:border-blue-500"
          />
        )}
        <div
          className="dropdown-menu h-[40vh] max-h-[320px] overflow-y-auto rounded-md border border-gray-200 bg-white p-2 shadow-md"
          onMouseLeave={() => {
            setIsKeyboardNav(false);
            setFocusedIndex(-1);
          }}
        >
          <ul>
            {filteredList.map((item, index) => (
              <li>
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.97 }}
                  className={`mb-1 flex w-full items-center gap-2 rounded-md border-2 border-gray-100 p-2 shadow-sm transition duration-300
                    ${focusedIndex === index ? "bg-gray-200" : ""}
                  `}
                  onMouseOver={() => {
                    if (isKeyboardNav) return;
                    setFocusedIndex(index);
                  }}
                  onClick={item.action}
                >
                  {item.icon || item.image}
                  <div className="ml-2 flex-1 text-left ">
                    <span className=" text-sm text-black">{item.name}</span>

                    <div className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
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
