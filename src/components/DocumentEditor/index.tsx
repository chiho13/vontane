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
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { Plus } from "lucide-react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { motion } from "framer-motion";

import Image from "next/image";

import { useTheme } from "styled-components";
import useClickOutside from "@/hooks/useClickOutside";

import { LayoutContext } from "../Layouts/AccountLayout";
import { setPoint } from "slate-history";

interface DocumentEditorProps {
  handleTextChange?: (value: any) => void;
}

type CustomElement = {
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

const withProtection = (editor) => {
  const { deleteBackward, deleteForward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.type === "equation",
      });
      if (match) {
        const [, path] = match;
        const start = Editor.start(editor, path);
        if (Path.equals(selection.anchor.path, start.path)) {
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  editor.deleteForward = (...args) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [match] = Editor.nodes(editor, {
        match: (n) => n.type === "equation",
      });
      if (match) {
        const [, path] = match;
        const end = Editor.end(editor, path);
        if (Path.equals(selection.anchor.path, end.path)) {
          return;
        }
      }
    }

    deleteForward(...args);
  };

  return editor;
};

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
        {/* <textarea
          className="w-full resize-none"
          ref={textareaRef}
          autoFocus
          onKeyDown={handleKeyDown}
        /> */}

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center rounded-md border-2 border-gray-100 p-3 shadow-sm hover:bg-gray-100"
          onClick={addBlock}
        >
          <Image
            src="/images/latex.png"
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

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  handleTextChange,
}) => {
  const theme = useTheme();
  const { isLocked } = useContext(LayoutContext);
  const editor = useMemo(() => withReact(createEditor()), []);
  const [slatevalue, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ]);

  const [showDropdown, setShowDropdown] = useState(false);
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

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [addedParagraphs, setAddedParagraphs] = useState<Set<string>>(
    new Set()
  );

  const [dropdownTop, setDropdownTop] = useState<number | null>(null);
  const [dropdownLeft, setDropdownLeft] = useState<number | null>(null);

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

      console.log(currentNode, hasEquationNode);

      console.log("hasEmptyParagraphNode", hasEmptyParagraphNode);
      console.log(Path.next(path));
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
      }

      const target = event.currentTarget as HTMLDivElement;
      const targetRect = target.getBoundingClientRect();

      setDropdownTop(targetRect.top + 50);
      setDropdownLeft(targetRect.left + 20);

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
              type: "paragraph",
              children: [{ text: "" }],
            },
            { at: newPath }
          );
          Transforms.select(editor, Editor.start(editor, newPath));
        }
      }
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const direction = event.key === "ArrowLeft" ? "left" : "right";

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
        direction === "right"
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

        if (
          nextNode.type !== "equation" &&
          ((isStartofBlock && direction === "left") ||
            (isEndofBlock && direction === "right"))
        ) {
          const targetPosition =
            direction === "left"
              ? Editor.end(editor, nextPath)
              : Editor.start(editor, nextPath);

          const prevSiblingNode = Editor.previous(editor, {
            at: nextPath,
          });
          if (prevSiblingNode) {
            console.log(prevSiblingNode[0]);
            setPrevNode(prevSiblingNode[0]);
          }

          event.preventDefault();
          Transforms.select(editor, targetPosition);
          return;
        }

        nextParagraph =
          direction === "left"
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
      if (
        prevNode &&
        prevNode.type === "equation" &&
        currentNode.type === "paragraph" &&
        Editor.isStart(editor, startPosition, currentNodePath)
      ) {
        // Move the cursor between paragraphs while skipping equation nodes, just like when the user hits the left arrow key
        const currentPosition = selection.anchor;
        const currentParagraph = Editor.node(editor, currentPosition.path);

        const nextParagraph = Editor.previous(editor, {
          at: currentParagraph[1],
          match: (n) => n.type === "paragraph",
        });

        if (nextParagraph) {
          const [nextNode, nextPath] = nextParagraph;
          const targetPosition = Editor.end(editor, nextPath);
          event.preventDefault();
          Transforms.select(editor, targetPosition);
        }
        return;
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

  const handleAddEquation = useCallback(
    (latex: string, path: Path) => {
      if (showDropdown) {
        const equationNode: CustomElement = {
          type: "equation",
          latex,
          children: [{ text: "" }],
        };

        // Check if the first paragraph is empty
        const [currentNode] = Editor.node(editor, path);

        // console.log(currentNode.children[0].children[0]);

        console.log(currentNode.children[0], path);
        console.log(
          currentNode.children[0].type === "paragraph",
          currentNode.children[0].text === ""
        );

        console.log(path);

        const isEmptyNode =
          currentNode.children[0].type === "paragraph" &&
          currentNode.children[0].text === "" &&
          currentNode.children.length === 1;

        console.log(isEmptyNode);
        if (!isEmptyNode) {
          // Replace the first paragraph with the equation node
          Transforms.setNodes(editor, equationNode, { at: path });

          // Insert an empty paragraph after the equation node
          Transforms.insertNodes(
            editor,
            { type: "paragraph", children: [{ text: "" }] },
            { at: Path.next(path) }
          );

          // Set the selection to the start of the new paragraph
          const newPath = Path.next(path);
          const newSelection = Editor.start(editor, newPath);
          Transforms.select(editor, newSelection);
        } else {
          // Insert the equation node after the current node
          Transforms.insertNodes(editor, equationNode, { at: Path.next(path) });

          // Insert an empty paragraph after the equation node
          Transforms.insertNodes(
            editor,
            { type: "paragraph", children: [{ text: "" }] },
            { at: Path.next(Path.next(path)) }
          );

          // Set the selection to the start of the new paragraph
          const newPath = Path.next(Path.next(path));
          const newSelection = Editor.start(editor, newPath);
          Transforms.select(editor, newSelection);
        }
      }
    },
    [showDropdown]
  );

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

          const newPath = Path.next(path);
          const newSelection = Editor.start(editor, newPath);
          Transforms.select(editor, newSelection);
        } else {
          Transforms.insertNodes(editor, equationNode, { at: Path.next(path) });

          //   Transforms.insertNodes(
          //     editor,
          //     { type: "paragraph", children: [{ text: "" }] },
          //     { at: Path.next(Path.next(path)) }
          //   );

          //   const newPath = Path.next(Path.next(path));
          //   const newSelection = Editor.start(editor, newPath);
          //   Transforms.select(editor, newSelection);
        }
      }
    },
    [showDropdown]
  );

  const toggleRef = useRef<HTMLButtonElement>(null);

  const renderElement = useCallback((props) => {
    const { attributes, children, element } = props;
    return (
      <div className="group relative mx-auto lg:w-[1000px]" {...attributes}>
        {element.type === "equation" && (
          <span
            {...attributes}
            contentEditable={false}
            className="mx-auto block w-[90%] rounded-md py-2 hover:bg-gray-100"
          >
            <BlockMath math={element.latex || ""} />
            <span style={{ display: "none" }}>{children}</span>
          </span>
        )}
        {element.type === "paragraph" && (
          <p {...attributes} className=" mx-auto block leading-relaxed">
            {children}
          </p>
        )}
        <div className="absolute -left-12 top-3 -mt-5 flex h-10 w-10 cursor-pointer items-center justify-center opacity-0 group-hover:opacity-100">
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
      </div>
    );
  }, []);

  useClickOutside(
    dropdownRef,
    () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    },
    toggleRef
  );

  return (
    <div
      tabIndex={0}
      className="relative mb-2 h-[400px] p-4 focus:outline-none focus-visible:border-gray-400"
    >
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
          renderElement={renderElement}
          onClick={(event) => handleCursorClick(event, editor)}
          onKeyDown={handleKeyDown}
          style={{
            height: "400px",
          }}
        />
        {showDropdown && activePath && (
          <div
            className="fixed z-10 mt-2 w-[320px]"
            style={{
              top: `${dropdownTop}px`,
              left: `${dropdownLeft}px`,
              transform: "translateX(20px)",
            }}
          >
            <MiniDropdown
              ref={dropdownRef}
              isOpen={showDropdown}
              onClick={() => {
                handleAddEditableEquationBlock(
                  "\\text{Edit me}",
                  JSON.parse(activePath)
                );
                setShowDropdown(false);
              }}
            />
          </div>
        )}
      </Slate>
    </div>
  );
};

export default DocumentEditor;
