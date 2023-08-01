import { motion } from "framer-motion";
import { useTheme } from "styled-components";
import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  List,
  FileQuestion,
  CheckCircle,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  ListChecks,
  LayoutList,
} from "lucide-react";
import { EditorContext } from "@/contexts/EditorContext";
import { Element as SlateElement, Editor, Path, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { TextIcon } from "@/icons/Text";
import { SlideBreak } from "@/icons/SlideBreak";
import { addSlideBreak } from "./helpers/addSlideBreak";
import { genNodeId } from "@/hoc/withID";
import { useArrowNavigation } from "@/hooks/useArrowNavigation";
import { toggleBlock, isParentTTS, isParentMCQ } from "./helpers/toggleBlock";
import { addImageBlock } from "./helpers/addImageBlock";
import { addMapBlock } from "./helpers/addMapBlock";
import { BsSoundwave } from "react-icons/bs";
import { addTTSBlock } from "./helpers/addTTSBlock";
import { TbBlockquote } from "react-icons/tb";
import { TfiMapAlt } from "react-icons/tfi";
import { MdChecklist } from "react-icons/md";

interface MiniDropdownProps {
  isOpen: boolean;
  addMCQBlock: () => void;
  addEquationBlock: () => void;

  genBlock: (value: string) => void;
  setShowDropdown: (value: boolean) => void;
  activePath: string;
  searchBarPosition: boolean;
}

// function isCurrentNodeMCQ(editor) {
//   const { selection } = editor;
//   if (!selection) return false;

//   const [node] = Editor.node(editor, selection);
//   return SlateElement.isElement(node) && node.type === "mcq";
// }

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
    const searchInputRef: any = useRef(null);

    const {
      editor,
      setActivePath,
      setShowEditBlockPopup,
      setSelectedElementID,
    } = useContext(EditorContext);
    const [currentNode] = Editor.node(editor, JSON.parse(activePath));
    const [isKeyboardNav, setIsKeyboardNav] = useState(false);
    const customElements = [
      {
        name: "Text",
        description: "Just start writing",
        action: closeDropdown,
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <TextIcon />
          </div>
        ),
      },
      {
        name: "Text to MP3",
        description: "Ultra-realistic AI Text to Speech",
        action: addTTSHandler,
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <BsSoundwave className="h-[30px] w-[30px] text-darkergray dark:text-darkergray" />
          </div>
        ),
      },
      {
        name: "Heading 1",
        description: "Big Section heading",
        action: () => addBlock("heading-one"),
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <Heading1 className="stroke-darkergray" />
          </div>
        ),
      },
      {
        name: "Heading 2",
        description: "Medium Section heading",
        action: () => addBlock("heading-two"),
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <Heading2 className="stroke-darkergray" />
          </div>
        ),
      },
      {
        name: "Heading 3",
        description: "Small Section heading",
        action: () => addBlock("heading-three"),
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <Heading3 className="stroke-darkergray" />
          </div>
        ),
      },
      {
        name: "Image",
        description: "Embed with a link",
        action: addImageHandler,
        icon: (
          <Image
            src="/images/sunandmountain.png"
            alt="add  image"
            width={44}
            height={44}
            className="rounded-md border  border-gray-300 dark:border-secondary"
          />
        ),
      },
      {
        name: "Map",
        description: "Embed a Map",
        action: addMapBlockHandler,
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-90">
            <TfiMapAlt className="h-[30px] w-[30px] text-darkergray dark:text-darkergray" />
          </div>
        ),
      },

      {
        name: "Slide Break",
        description: "Slide mode: break the page",
        action: addSlideBreakHandler,
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <SlideBreak />
          </div>
        ),
      },
      {
        name: "Bullet Points",
        description: "Create bullet point list",
        action: () => addBlock("bulleted-list"),
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <List className="stroke-darkergray" />
          </div>
        ),
      },
      {
        name: "Numbered List",
        description: "Create an ordered list with numbering",
        action: () => addBlock("numbered-list"),
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <ListOrdered className="stroke-darkergray" />
          </div>
        ),
      },
      {
        name: "To do List",
        description: "Keep track of tasks",
        action: () => addBlock("checked-list"),
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <ListChecks className="stroke-darkergray" />
          </div>
        ),
      },

      {
        name: "Multiple Choice",
        description: "Set a multiple choice answer",
        action: () => addBlock("option-list-item"),
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <LayoutList className=" rotate-180 stroke-darkergray" />
          </div>
        ),
      },
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
            className="rounded-md border  border-gray-300 bg-white p-1 dark:opacity-80"
          />
        ),
      },

      {
        name: "Quote",
        description: "Capture a quote",
        action: () => addBlock("block-quote"),
        icon: (
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <TbBlockquote className="stroke-darkergray" />
          </div>
        ),
      },
    ].filter((el) => {
      const isRoot = JSON.parse(activePath).length === 1;
      const [parent, parentPath] = Editor.parent(
        editor,
        JSON.parse(activePath)
      );

      if (
        !isRoot &&
        (el.name === "Slide Break" ||
          el.name === "Text to MP3" ||
          el.name === "Map")
      ) {
        return false;
      }
      return true;
    });

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

    const filteredList = filterList(customElements, search);
    const { focusedIndex, setFocusedIndex, handleArrowNavigation } =
      useArrowNavigation(filteredList, 0, closeDropdown);
    const closeOnEmptyInput = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Backspace") {
        if (search.length === 0) {
          event.preventDefault();
          setShowDropdown(false);

          Transforms.select(
            editor,
            Editor.start(editor, JSON.parse(activePath))
          );

          ReactEditor.focus(editor);
        }
      }
    };

    function addBlock(type: string) {
      toggleBlock(editor, type);
      setShowDropdown(false);
      Transforms.select(editor, Editor.start(editor, JSON.parse(activePath)));

      ReactEditor.focus(editor);
    }

    function closeDropdown() {
      setShowDropdown(false);

      Transforms.select(editor, Editor.start(editor, JSON.parse(activePath)));

      ReactEditor.focus(editor);

      if (
        SlateElement.isElement(currentNode) &&
        currentNode.type !== "paragraph"
      ) {
        const newNode = {
          id: genNodeId(),
          type: "paragraph",
          align: "start",
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

    function addImageHandler() {
      console.log("add image");
      const { newPath: addedPath, id } = addImageBlock(
        editor,
        JSON.parse(activePath)
      );
      setShowDropdown(false);
      Transforms.select(editor, Editor.start(editor, Path.next(addedPath)));
      ReactEditor.focus(editor);

      setSelectedElementID(id);
      setShowEditBlockPopup({
        open: true,
        element: "image",
      });
      setActivePath(JSON.stringify(addedPath));
    }

    function addMapBlockHandler() {
      const { newPath: addedPath, id } = addMapBlock(
        editor,
        JSON.parse(activePath)
      );
      setShowDropdown(false);
      Transforms.select(editor, Editor.start(editor, addedPath));
      ReactEditor.focus(editor);
      setActivePath(JSON.stringify(addedPath));
    }

    function addTTSHandler() {
      const { newPath: addedPath, id } = addTTSBlock(
        editor,
        JSON.parse(activePath)
      );
      setShowDropdown(false);
      Transforms.select(editor, Editor.start(editor, addedPath));
      ReactEditor.focus(editor);
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

    const listRefs: any = useRef(null);
    listRefs.current = [];
    const addToRefs = (el) => {
      if (el && !listRefs.current.includes(el)) {
        listRefs.current.push(el);
      }
    };

    useEffect(() => {
      if (isKeyboardNav && listRefs.current[focusedIndex]) {
        listRefs.current[focusedIndex].scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, [focusedIndex, isKeyboardNav]);

    return (
      <>
        <div
          className="closeOutside z-1  fixed left-0 top-0 h-full w-screen  opacity-50"
          onClick={() => {
            setShowDropdown(false);
          }}
        ></div>
        <div className="relative">
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
              className="absolute -top-[50px] mb-2 w-full rounded-md border border-gray-500 bg-white px-2 py-1 outline-none focus:border-blue-500 dark:bg-muted dark:focus:border-foreground"
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
                setIsKeyboardNav(true);
                handleArrowNavigation(e);
              }}
              placeholder="Search"
              className="absolute -bottom-[50px] mt-2 w-full rounded-md border border-gray-500 bg-white px-2 py-1 outline-none focus:border-blue-500 dark:bg-muted dark:focus:border-foreground"
            />
          )}
          <div
            ref={ref}
            className="dropdown-menu h-[320px] overflow-y-auto rounded-md border border-gray-200 bg-white p-2 shadow-md dark:border-accent dark:bg-secondary"
            onMouseLeave={() => {
              setIsKeyboardNav(false);
              setFocusedIndex(-1);
            }}
          >
            <ul>
              {filteredList.map((item, index) => (
                <li ref={addToRefs} key={index}>
                  <motion.button
                    key={index}
                    whileTap={{ scale: 0.97 }}
                    className={`mb-1 flex w-full items-center gap-2 rounded-md border-2 border-gray-100 p-2 shadow-sm transition duration-300 dark:border-accent
                    ${
                      focusedIndex === index
                        ? "border-gray-200 bg-gray-200 dark:border-muted-foreground dark:bg-muted"
                        : ""
                    }
                  `}
                    onMouseOver={() => {
                      if (isKeyboardNav) return;
                      setFocusedIndex(index);
                    }}
                    onClick={item.action}
                  >
                    {item.icon || item.image}
                    <div className="ml-2 flex-1 text-left ">
                      <span className=" text-sm text-black dark:text-foreground">
                        {item.name}
                      </span>

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
      </>
    );
  }
);

MiniDropdown.displayName = "MiniDropdown";
