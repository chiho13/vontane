// import {
//   React,
//   useState,
//   useCallback,
//   Transforms,
//   Slate,
//   Editable,
//   ReactEditor,
//   DndContext,
//   SortableContext,
//   verticalListSortingStrategy,
//   DragOverlay,
// } from '../deps';

import React, {
  useEffect,
  useCallback,
  useMemo,
  useState,
  useRef,
  useContext,
  createContext,
} from "react";
import {
  createEditor,
  Editor,
  Transforms,
  Path,
  BaseEditor,
  Range,
  Node,
  Element,
} from "slate";

import { createPortal } from "react-dom";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { Plus, CornerDownLeft } from "lucide-react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import "katex/dist/contrib/mhchem.min.js";
import { AnimatePresence, motion } from "framer-motion";

import Image from "next/image";

import { useTheme } from "styled-components";
import useClickOutside from "@/hooks/useClickOutside";

import { LayoutContext } from "../Layouts/AccountLayout";
import { y_animation_props } from "../Dropdown";

import { DndContext, DragOverlay } from "@dnd-kit/core";

import { genNodeId } from "@/hoc/withID";

import {
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useEditor } from "@/hooks/useEditor";
import { ActiveElementProvider } from "@/contexts/ActiveElementContext";
import { SortableElement } from "./SortableElement";
import { ElementSelector } from "./EditorElements";

interface DocumentEditorProps {
  handleTextChange?: (value: any) => void;
}

type CustomElement = {
  id: string;
  type: "paragraph" | "equation";
  children: CustomText[];
  latex?: string; // Add this line for the latex string
};

type CustomText = {
  text: string;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface MiniDropdownProps {
  isOpen: boolean;
  onClick: () => void;
}

const MiniDropdown = React.forwardRef<HTMLDivElement, MiniDropdownProps>(
  ({ isOpen, onClick }, ref) => {
    const addBlock = (event: React.KeyboardEvent) => {
      onClick();
    };

    return (
      <div
        ref={ref}
        className="dropdown-menu rounded-md border border-gray-200 bg-white p-2 shadow-md"
      >
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center rounded-md border-2 border-gray-100 p-3 shadow-sm transition duration-300 hover:bg-gray-100"
          onClick={addBlock}
        >
          <Image
            src="/images/tex.png"
            alt="add latex block equation"
            width={60}
            height={60}
            className="rounded-md border"
          />
          <span className="ml-4 ">Add Block Equation</span>
        </motion.button>
      </div>
    );
  }
);

MiniDropdown.displayName = "MiniDropdown";

interface EditBlockPopupProps {
  onChange: (value: string) => void;
  onClick: () => void;
  onEnterClose: (e: React.KeyboardEvent) => void;
  latexValue: string;
}

const EditBlockPopup = React.forwardRef<HTMLDivElement, EditBlockPopupProps>(
  ({ onChange, onClick, onEnterClose, latexValue }, ref) => {
    const [value, setValue] = useState(latexValue);

    useEffect(() => {
      setValue(latexValue);
    }, [latexValue]);

    const onEquationChange = (e) => {
      console.log(e.target.value);
      setValue(e.target.value);
      onChange(e.target.value);
    };

    return (
      <div
        ref={ref}
        className="flex h-[100px] justify-between rounded-md border border-gray-200 bg-gray-100 p-2 shadow-md"
      >
        <textarea
          value={value}
          className="h-full w-[230px] resize-none bg-transparent p-1 focus:outline-none focus-visible:border-gray-400"
          onChange={onEquationChange}
          autoFocus
          onKeyDown={onEnterClose}
        />
        <div>
          <button
            className="flex items-center rounded-md bg-[#007AFF] px-2 py-1  text-sm text-white  shadow-sm transition duration-300 hover:bg-[#006EE6] "
            onClick={onClick}
          >
            <span className="mr-1">Done</span>
            <CornerDownLeft color="white" width={16} />
          </button>
        </div>
      </div>
    );
  }
);

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  handleTextChange,
}) => {
  const theme = useTheme();
  const { isLocked } = useContext(LayoutContext);
  const editor = useEditor();
  const [slatevalue, setValue] = useState([
    {
      id: genNodeId(),
      type: "paragraph",
      children: [{ text: "" }],
    },
  ]);

  const [activeId, setActiveId] = useState(null);

  const activeIndex = activeId
    ? slatevalue.findIndex((el) => el.id === activeId)
    : -1;

  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditBlockPopup, setShowEditBlockPopup] = useState(false);

  const [offsetDropdownPosition, setOffsetDropdownPosition] = useState<number>(
    isLocked ? -150 : 0
  );

  useEffect(() => {
    setOffsetDropdownPosition(isLocked ? -150 : 0);
  }, [isLocked]);

  const [dropdownPositions, setDropdownPositions] = useState<
    Map<string, { top: number; left: number }>
  >(new Map());

  const [activePath, setActivePath] = useState<string | null>(null);
  const [activeEditEquationPath, setactiveEditEquationPath] = useState<
    string | null
  >(null);

  const addSomethingDropdownRef = useRef<HTMLDivElement | null>(null);
  const editBlockDropdownRef = useRef<HTMLDivElement | null>(null);
  const [addedParagraphs, setAddedParagraphs] = useState<Set<string>>(
    new Set()
  );

  const [dropdownTop, setDropdownTop] = useState<number | null>(null);
  const [dropdownLeft, setDropdownLeft] = useState<number | null>(null);

  const slatePathToNumber = (path: number[]): number => {
    const pathStr = path.map((num) => num.toString()).join("");
    return parseInt(pathStr, 10);
  };

  const openMiniDropdown = useCallback(
    (event: React.MouseEvent, path: Path) => {
      const currentpathString = JSON.stringify(path);

      const offsetDropdownPosition = isLocked ? -150 : 0;
      const [currentNode] = Editor.node(editor, path);
      const { selection } = editor;

      //   const lastNode = Editor.node(editor, selection.focus);
      if (!selection) return;

      const [parentNode, parentPath] = Editor.parent(
        editor,
        selection.anchor.path
      );
      const numPath = slatePathToNumber(path);
      console.log(numPath);
      const nextNumPath = slatePathToNumber(Path.next(path));
      console.log(nextNumPath);
      const parentpathString = JSON.stringify(parentPath);

      const [lastNode, lastPath] = Editor.last(editor, []);

      const lastpathString = JSON.stringify(lastPath.slice(0, -1));
      //   console.log(lastPath[0]);
      const hasEmptyParagraphNode =
        currentNode.type === "paragraph" &&
        currentNode.children.length === 1 &&
        currentNode.children[0].text === "";

      const hasEquationNode =
        currentNode.type === "equation" && currentNode.latex !== "";

      const target = event.currentTarget as HTMLDivElement;
      const targetRect = target.getBoundingClientRect();

      if (
        !hasEmptyParagraphNode &&
        !hasEquationNode &&
        parentpathString === lastpathString
      ) {
        Transforms.insertNodes(
          editor,
          { type: "paragraph", children: [{ text: "" }] },
          { at: Path.next(path) }
        );
        setDropdownTop(targetRect.top + 60);
        setDropdownLeft(targetRect.right + 60);
      } else {
        setDropdownTop(targetRect.top + 30);
        setDropdownLeft(targetRect.right + 60);
      }

      setShowDropdown((prevState) => !prevState);
      setActivePath(currentpathString);
    },
    [dropdownPositions, isLocked]
  );

  const [prevNode, setPrevNode] = useState<Node | null>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const { selection } = editor;

    if (!selection || !ReactEditor.isFocused(editor)) {
      return;
    }

    const startPosition = selection.anchor;
    const [currentNode, currentNodePath] = Editor.parent(
      editor,
      startPosition.path
    );

    if (event.key === "Enter") {
      event.preventDefault();

      if (selection) {
        const [parentNode, parentPath] = Editor.parent(
          editor,
          selection.anchor.path
        );
        if (parentNode.type === "paragraph") {
          const newPath = Path.next(parentPath);
          Transforms.insertNodes(
            editor,
            {
              id: genNodeId(),
              type: "paragraph",
              children: [{ text: "" }],
            },
            { at: newPath }
          );
          Transforms.select(editor, Editor.start(editor, newPath));
        }
      }
    }

    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowRight" ||
      event.key === "ArrowUp" ||
      event.key === "ArrowDown"
    ) {
      const directionH = event.key === "ArrowLeft" ? "left" : "right";
      const directionV = event.key === "ArrowUp" ? "up" : "down";

      const currentPosition = selection.anchor;
      const currentParagraph = Editor.node(editor, currentPosition.path);

      const isStartofBlock = Editor.isStart(
        editor,
        currentPosition,
        currentNodePath
      );
      const isEndofBlock = Editor.isEnd(
        editor,
        currentPosition,
        currentNodePath
      );
      let nextParagraph =
        directionH === "right"
          ? Editor.next(editor, {
              at: currentParagraph[1],
              match: (n) => n.type === "paragraph",
            })
          : Editor.previous(editor, {
              at: currentParagraph[1],
              match: (n) => n.type === "paragraph",
            });

      while (nextParagraph) {
        const [nextNode, nextPath] = nextParagraph;

        const prevSiblingNode = Editor.previous(editor, {
          at: nextPath,
        });

        if (prevSiblingNode) {
          console.log(prevSiblingNode[0]);
          setPrevNode(prevSiblingNode[0]);
        }

        if (
          nextNode.type !== "equation" &&
          ((isStartofBlock && directionH === "left") ||
            (isEndofBlock && directionH === "right"))
        ) {
          const [currentNode, currentNodePath] = Editor.node(editor, nextPath);
          const isEmpty = currentNode.children[0].text === "";

          const targetPosition =
            directionH === "left"
              ? Editor.end(editor, nextPath)
              : Editor.start(editor, nextPath);

          event.preventDefault();
          Transforms.select(editor, targetPosition);
          return;
        }

        nextParagraph =
          directionH === "left"
            ? Editor.previous(editor, {
                at: nextPath,
                match: (n) => n.type === "paragraph",
              })
            : Editor.next(editor, {
                at: nextPath,
                match: (n) => n.type === "paragraph",
              });
      }
    }

    if (event.key === "Backspace") {
      console.log("sdfsdf", currentNode);
      if (
        currentNode.type === "paragraph" &&
        Editor.isStart(editor, startPosition, currentNodePath)
      ) {
        // Move the cursor between paragraphs while skipping equation nodes, just like when the user hits the left arrow key
        const currentPosition = selection.anchor;
        const currentParagraph = Editor.node(editor, currentPosition.path);

        if (prevNode && prevNode.type === "equation") {
          event.preventDefault();
          const nextParagraph = Editor.previous(editor, {
            at: currentParagraph[1],
            match: (n) => n.type === "paragraph",
          });

          if (nextParagraph) {
            const [nextNode, nextPath] = nextParagraph;
            const targetPosition = Editor.end(editor, nextPath);
            Transforms.select(editor, targetPosition);
          }
        }
      } else {
        // If the current node is a paragraph and the previous node is not an equation or the cursor is not at the start of the paragraph, delete the character
        event.preventDefault();
        Transforms.delete(editor, { unit: "character", reverse: true });
      }
    }
  };

  function handleCursorClick(event, editor) {
    const { selection } = editor;
    if (selection) {
      const startPosition = selection.anchor;
      const [currentNode, currentNodePath] = Editor.parent(
        editor,
        startPosition.path
      );

      console.log(currentNode);
      console.log(
        "start",
        Editor.isStart(editor, startPosition, currentNodePath)
      );
      // If the cursor is at the start of a paragraph
      if (
        currentNode.type === "paragraph" &&
        Editor.isStart(editor, startPosition, currentNodePath)
      ) {
        const prevSiblingNode = Editor.previous(editor, {
          at: currentNodePath,
        });

        if (prevSiblingNode) {
          console.log(prevSiblingNode[0]);
          setPrevNode(prevSiblingNode[0]);
        }
      }
    }
  }

  const handleEditLatex = (value: string, path: Path) => {
    console.log(value);
    const latex = value;
    const equationNode: CustomElement = {
      type: "equation",
      latex,
      isEditable: true, // Add this line to make the equation editable
      children: [{ text: "" }],
    };

    Transforms.setNodes(editor, equationNode, { at: path });
  };

  const [getCurrentLatex, setCurrentLatex] = useState("");

  const openEditBlockPopup = (event: React.MouseEvent, path: Path) => {
    event.stopPropagation();
    const target = event.currentTarget as HTMLDivElement;
    const targetRect = target.getBoundingClientRect();

    const currentPathString = JSON.stringify(path);
    setactiveEditEquationPath((prevPath) =>
      prevPath === currentPathString ? null : currentPathString
    );

    const [currentNode] = Editor.node(editor, path);
    setCurrentLatex(currentNode.latex);

    setShowEditBlockPopup(true);
    setDropdownTop(targetRect.top + 60);
    setDropdownLeft(targetRect.left + 60);
  };

  const toggleRef = useRef<HTMLButtonElement>(null);
  const toggleEditBlockRef = useRef<HTMLElement>(null);

  const handleAddEditableEquationBlock = useCallback(
    (latex: string, path: Path) => {
      if (showDropdown) {
        const equationNode: CustomElement = {
          type: "equation",
          latex,
          isEditable: true, // Add this line to make the equation editable
          children: [{ text: "" }],
        };

        const [currentNode] = Editor.node(editor, path);
        const isEmptyNode =
          (currentNode.type === "paragraph" &&
            currentNode.children[0].text === "") ||
          currentNode.children[0].text === " ";

        if (isEmptyNode) {
          Transforms.setNodes(editor, equationNode, { at: path });

          Transforms.insertNodes(
            editor,
            { type: "paragraph", children: [{ text: "" }] },
            { at: Path.next(path) }
          );
          setactiveEditEquationPath(JSON.stringify(path));
          const newPath = Path.next(path);
          const newSelection = Editor.start(editor, newPath);
          Transforms.select(editor, newSelection);
        } else {
          Transforms.insertNodes(editor, equationNode, { at: Path.next(path) });
          setactiveEditEquationPath(JSON.stringify(Path.next(path)));
        }

        // const target = toggleEditBlockRef.current;
        // const targetOffset = target && target.getBoundingClientRect();
        // console.log(toggleEditBlockRef);
        setShowEditBlockPopup(true);
      }
    },
    [showDropdown, toggleEditBlockRef]
  );

  const renderElement = useCallback((props) => {
    const { attributes, children, element } = props;

    const elementPath = ReactEditor.findPath(editor, element);
    const isRoot = elementPath.length === 1;

    const addButton = (
      <div className="z-100 absolute right-0 top-3 -mt-5 flex h-10 w-10  cursor-pointer items-center justify-center opacity-0 group-hover:opacity-100">
        <button
          className="rounded-md hover:bg-gray-200"
          onClick={(event) => {
            event.stopPropagation();
            openMiniDropdown(event, ReactEditor.findPath(editor, element));
          }}
          ref={toggleRef}
        >
          <Plus color={theme.colors.darkgray} />
        </button>
      </div>
    );

    const content = isRoot ? (
      <SortableElement
        {...props}
        renderElement={(props) => <ElementSelector {...props} />}
      />
    ) : (
      <ElementSelector {...props} />
    );

    return (
      <div className="group relative">
        {content}
        {addButton}
      </div>
    );
  }, []);

  const handleDragEnd = useCallback(
    function (event) {
      const { active, over } = event;
      if (!over) {
        return;
      }
      const overIndex = editor.children.findIndex((el) => el.id === over.id);

      if (active.id !== over.id) {
        Transforms.moveNodes(editor, {
          at: [],
          match: (node) => node.id === active.id,
          to: [overIndex],
        });
      }

      setActiveId(null);
    },
    [editor, editor.children]
  );

  const handleDragStart = useCallback(function ({ active }) {
    setActiveId(active.id);
  }, []);

  // const renderElement = useCallback((props) => {
  //   const { attributes, children, element } = props;
  //   const path = ReactEditor.findPath(editor, element);
  //   return (
  //     <div className="group relative" {...attributes}>
  //       {element.type === "equation" && (
  //         <div
  //           tabIndex={0}
  //           className={`my-2 flex w-full items-center rounded-md p-2 ${
  //             element.latex.length === 0 ? "bg-gray-100" : "justify-center"
  //           } cursor-pointer transition duration-300 hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-200`}
  //           onClick={(event) =>
  //             openEditBlockPopup(event, ReactEditor.findPath(editor, element))
  //           }
  //           contentEditable={false}
  //           ref={toggleEditBlockRef}
  //         >
  //           <BlockMath math={element.latex || ""} />

  //           {element.latex.length === 0 && (
  //             <div className="flex items-center">
  //               <Image
  //                 src="/images/tex.png"
  //                 alt="add latex block equation"
  //                 width={50}
  //                 height={50}
  //                 className="opacity-30"
  //               />
  //               <span className="ml-4 opacity-30">Add Block Equation</span>
  //             </div>
  //           )}

  //           <span style={{ display: "none" }}>{children}</span>
  //         </div>
  //       )}
  //       {element.type === "paragraph" && (
  //         <p {...attributes} className=" mx-auto block leading-relaxed">
  //           {children}
  //         </p>
  //       )}
  // <div className="absolute -left-16 top-3 -mt-5 flex h-10 w-10 cursor-pointer items-center justify-center opacity-0 group-hover:opacity-100">
  //   <button
  //     className="rounded-md hover:bg-gray-200"
  //     onClick={(event) => {
  //       event.stopPropagation();
  //       openMiniDropdown(event, ReactEditor.findPath(editor, element));
  //     }}
  //     ref={toggleRef}
  //   >
  //     <Plus color={theme.colors.darkgray} />
  //   </button>
  //       </div>
  //     </div>
  //   );
  // }, []);

  useClickOutside(
    addSomethingDropdownRef,
    () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    },
    toggleRef
  );

  const closeEditableDropdown = () => {
    if (showEditBlockPopup) {
      setShowEditBlockPopup(false);
      setactiveEditEquationPath(null);
    }
  };

  return (
    <div
      tabIndex={0}
      className="relative mx-auto mb-2 mt-5 block h-[400px] rounded-md p-4 focus:outline-none focus-visible:border-gray-300"
    >
      <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <SortableContext
          items={slatevalue}
          strategy={verticalListSortingStrategy}
        >
          <ActiveElementProvider activeIndex={activeIndex}>
            <Slate
              editor={editor}
              value={slatevalue}
              onChange={(newValue) => {
                setValue(newValue);

                if (handleTextChange) {
                  handleTextChange(newValue);
                }
              }}
            >
              <Editable
                className="relative mx-auto h-[400px] overflow-auto lg:w-[900px]"
                placeholder="Press '/ for prompts"
                renderElement={renderElement}
                onKeyDown={handleKeyDown}
              />
            </Slate>
          </ActiveElementProvider>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <DragOverlayContent
              element={slatevalue.find((el) => el.id === activeId)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <AnimatePresence>
        {showDropdown && activePath && (
          <motion.div
            {...y_animation_props}
            className="fixed fixed bottom-0 right-0 left-0 z-10 mx-auto mt-2 w-[320px]"
            style={{
              top: `${dropdownTop}px`,
            }}
          >
            <MiniDropdown
              ref={addSomethingDropdownRef}
              isOpen={showDropdown}
              onClick={() => {
                handleAddEditableEquationBlock("", JSON.parse(activePath));
                setShowDropdown(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEditBlockPopup && activeEditEquationPath && (
          <>
            <motion.div
              {...y_animation_props}
              className="fixed z-10 mt-2 w-[320px]"
              style={{
                top: `${dropdownTop}px`,
                right: `${dropdownLeft}px`,
              }}
            >
              <EditBlockPopup
                ref={editBlockDropdownRef}
                onChange={(value) =>
                  handleEditLatex(value, JSON.parse(activeEditEquationPath))
                }
                latexValue={getCurrentLatex}
                onClick={closeEditableDropdown}
                onEnterClose={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    closeEditableDropdown();
                  }
                }}
              />
            </motion.div>
            <div
              tabIndex={0}
              onClick={closeEditableDropdown}
              className="closeOutside fixed bottom-0 left-0 h-screen w-screen opacity-50"
              style={{
                height: "calc(100vh - 50px",
              }}
            ></div>
          </>
        )}
      </AnimatePresence>
    </div>
    // <div
    //   tabIndex={0}
    //   className="relative mb-2 mt-5 block h-[400px] rounded-md border-2 border-gray-100 bg-white p-4 focus:outline-none focus-visible:border-gray-300 lg:w-[750px]"
    // >
    //   <Slate
    //     editor={editor}
    //     value={slatevalue}
    //     onChange={(newValue) => {
    //       setValue(newValue);

    //       if (handleTextChange) {
    //         handleTextChange(newValue);
    //       }
    //     }}
    //   >
    //     <Editable
    //       renderElement={renderElement}
    //       onClick={(event) => handleCursorClick(event, editor)}
    //       onKeyDown={handleKeyDown}
    //       style={{
    //         height: "400px",
    //       }}
    //     />
    //   </Slate>
  );
};

export default DocumentEditor;

const DragOverlayContent = ({ element }) => {
  const editor = useEditor();
  const [value] = useState([{ ...element }]);

  return (
    <Slate editor={editor} value={value}>
      <div style={{ paddingLeft: 30 }}>
        <Editable
          readOnly
          renderElement={(props) => <ElementSelector {...props} />}
        />
      </div>
    </Slate>
  );
};
