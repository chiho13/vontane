import React, {
  useEffect,
  useCallback,
  useMemo,
  useState,
  useRef,
  useContext,
  createContext,
  useLayoutEffect,
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
  Location,
  Text,
  Point,
} from "slate";

import { ImageEmbedLink } from "@/components/DocumentEditor/EditorElements/ImageElement";
import scrollIntoView from "scroll-into-view-if-needed";
import { isEqual } from "lodash";
import { EditorContext } from "@/contexts/EditorContext";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { Plus, Sidebar } from "lucide-react";
import {
  VscLayoutSidebarRightOff,
  VscLayoutSidebarRight,
} from "react-icons/vsc";
import "katex/dist/katex.min.css";
import "katex/dist/contrib/mhchem.min.js";
import { AnimatePresence, motion } from "framer-motion";

import styled, { useTheme } from "styled-components";
import useClickOutside from "@/hooks/useClickOutside";

import { LayoutContext } from "../Layouts/AccountLayout";
import { y_animation_props } from "../Dropdown";

import { findElementInSlateValue } from "./helpers/findElementInSlate";
import { MathQuestionGenerator } from "../QuestionGenerator/Math";
import { extractTextValues } from "@/components/DocumentEditor/helpers/extractText";
import { useRouter } from "next/router";
import { DraggableCore } from "react-draggable";
import { Portal } from "react-portal";
import { Toolbar } from "@/components/Toolbar";
import { up_animation_props } from "@/config/framer";

import { slightbouncey } from "@/config/framer";
import {
  toggleBlock,
  toggleFormat,
  isParentTTS,
  insertNewParagraph,
} from "./helpers/toggleBlock";

import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDndMonitor,
} from "@dnd-kit/core";

import { genNodeId } from "@/hoc/withID";

import {
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ActiveElementProvider } from "@/contexts/ActiveElementContext";
import { SortableElement } from "./SortableElement";
import { ElementSelector } from "./EditorElements";
import { DragOverlayContent } from "./DragOverlayContent";
import { RightSideBar } from "@/components/RightSidebar";

import { findAncestorWithClass } from "@/utils/findAncestors";

import { useNewColumn } from "@/contexts/NewColumnContext";
import { useSensor, useSensors, MouseSensor } from "@dnd-kit/core";
import { findPathById, createColumns } from "./helpers/createColumns";
import { FloatingModal } from "@/components/FloatingModal";
import { Leaf } from "./LeafElements/TextLeaf";
import { MiniDropdown } from "./MiniDropdown";
import { OptionMenu } from "./OptionMenu";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { TextSpeech } from "@/components/TextSpeech";
import ErrorBoundary from "../Errorboundary";
import { textRegex } from "./helpers/textRegex";
import { addMCQBlock } from "./helpers/addMCQBlock";
import { breakpoints } from "@/utils/breakpoints";
import { useLocalStorage } from "usehooks-ts";
import { HOTKEYS } from "@/config/hotkeys";
import isHotkey from "is-hotkey";
interface DocumentEditorProps {
  workspaceId: string;
  handleTextChange?: (value: any) => void;
  initialSlateValue?: any;
  setFetchWorkspaceIsLoading: (value: any) => void;
}

type CustomElement = {
  id: string;
  type: string;
  children: CustomText[];
  altText?: string;
  correctAnswer?: false;
  questionNumber?: number;
  voice_id: string;
  name: string;
  content: string;
  liveContent: string;
  audio_url: string;
  file_name: string;
  latex?: string; // Add this line for the latex string
};

type CustomText = {
  url: string | undefined;
  highlighted: any;
  link: any;
  highlight: any;
  blank: any;
  strikethrough: any;
  underline: any;
  italic: any;
  bold: any;
  text: string;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const EditableStyle = styled.div`
  .editable-scrollbar::-webkit-scrollbar {
    width: 5px;
    border-radius: 3px;
  }

  .editable-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 3px;
  }

  .editable-scrollbar::-webkit-scrollbar-thumb {
    background: #aaaaaa;
    border-radius: 3px;

    .dark & {
      background: hsl(212 17% 30%);
    }
  }
`;

const StyledMiniToolbar = styled(motion.div)`
  position: absolute;
  z-index: 20;
  display: block;
`;

import { EditBlockPopup } from "../EditEquationBlock";
import { EnglishQuestionGenerator } from "../QuestionGenerator/English";
import useTextSpeechStatusPolling from "@/hooks/useTextSpeechAPI";
import { addEditableEquationBlock } from "./helpers/addEquationBlock";
import useResizeSidebar from "@/hooks/useResizeSidebar";
import { debounce } from "lodash";
import { DOMRange } from "slate-react/dist/utils/dom";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  workspaceId,
  handleTextChange,
  initialSlateValue,
  setFetchWorkspaceIsLoading,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { isLocked } = useContext(LayoutContext);
  const {
    editor,
    showEditBlockPopup,
    setShowEditBlockPopup,
    activePath,
    setActivePath,
    selectedElementID,
    setSelectedElementID,
  } = useContext(EditorContext);

  const [slatevalue, setValue] = useState(initialSlateValue);
  const [ghostslatevalue, setGhostValue] = useState(initialSlateValue);

  const debouncedSetSlateValue = debounce((value) => {
    setValue(value);
  }, 300);
  const [currentSlateKey, setCurrentSlateKey] = useState(workspaceId);
  const [activeId, setActiveId] = useState(null);

  const activeIndex = activeId
    ? slatevalue.findIndex((el: { id: any }) => el.id === activeId)
    : -1;

  const [showDropdown, setShowDropdown] = useState(false);

  const sensors = useSensors(useSensor(MouseSensor));

  const [dropdownPositions, setDropdownPositions] = useState<
    Map<string, { top: number; left: number }>
  >(new Map());

  const [activeEditEquationPath, setactiveEditEquationPath] = useState<
    string | null
  >(null);

  const addSomethingDropdownRef = useRef<HTMLDivElement | null>(null);
  const editBlockDropdownRef = useRef<HTMLDivElement | null>(null);

  const [dropdownTop, setDropdownTop] = useState<number>(0);
  const [dropdownLeft, setDropdownLeft] = useState<number>(0);

  const [dropdownEditBlockTop, setDropdownEditBlockTop] = useState<
    number | null
  >(0);
  const [dropdownEditBlockLeft, setDropdownEditBlockLeft] = useState<
    number | null
  >(0);

  const { creatingNewColumn, setCreatingNewColumn } = useNewColumn();

  const [showFloatingModal, setShowFloatingModal] = useState({
    open: false,
    subject: "",
  });

  const [miniToolbarPosition, setMiniToolbarPosition] = useState({
    x: 0,
    y: 0,
  });

  const [searchMinidropdownText, setSearchMinidropdownText] = useState<
    string | null
  >(null);

  const [usingCommandLine, setusingCommandLine] = useState(false);

  const [showMiniToolbar, setShowMiniToolbar] = useState(false);

  const generateKey = () => {
    const timestamp = new Date().getTime();
    const randomNumber = Math.floor(Math.random() * 1000);
    return `slate-key-${timestamp}-${randomNumber}`;
  };

  useEffect(() => {
    setValue(initialSlateValue);
    setFetchWorkspaceIsLoading(false);
    // setGhostValue(initialSlateValue);
    setCurrentSlateKey(generateKey());
    console.log(editor.children);
  }, [initialSlateValue, workspaceId]);

  const [searchBarPosition, setSearchBarPosition] = useState(false);

  const nodeIsEmpty = (currentNode: { children: string | any[] }) => {
    if (
      currentNode.children.length === 1 &&
      currentNode.children[0].text === ""
    ) {
      return true;
    }

    // Iterate over all children nodes
    for (const child of currentNode.children) {
      // Check for different element types
      if (child.type === "equation" || child.type === "mcq") {
        return false;
      }
    }

    return true;
  };
  const openMiniDropdown = useCallback(
    (path: Path) => {
      const currentpathString = JSON.stringify(path);

      // const sideBarOffset = isLocked ? -240 : 0;

      console.log(path);
      setActivePath(currentpathString);
      const currentElement = document.querySelector(
        `[data-path="${JSON.stringify(path)}"]`
      );
      if (!currentElement) return;
      const targetRect = currentElement.getBoundingClientRect();

      console.log(currentElement);
      const windowHeight = window.innerHeight;
      const dropdownHeight = 370;
      console.log(dropdownHeight);
      const spaceBelowTarget = windowHeight - targetRect.bottom;

      const currentNode = Node.get(editor, path);

      const isEmpty =
        currentNode.children.length === 1 &&
        currentNode.children[0].text === "" &&
        currentNode.type !== "equation" &&
        currentNode.type !== "mcq" &&
        currentNode.type !== "image" &&
        currentNode.type !== "slide";
      console.log(currentNode.type);
      console.log(targetRect.height);
      if (!isEmpty) {
        insertNewParagraph(editor, Path.next(path));
        setActivePath(JSON.stringify(Path.next(path)));
      }
      console.log(isEmpty);
      let topOffset = isEmpty ? 15 : 50;

      let showDropdownAbove = false;

      if (spaceBelowTarget < dropdownHeight) {
        topOffset = -(dropdownHeight - targetRect.height + (isEmpty ? 2 : -25));
        showDropdownAbove = true;
      }
      setSearchBarPosition(spaceBelowTarget < dropdownHeight);

      setDropdownTop(
        showDropdownAbove
          ? targetRect.top + topOffset
          : targetRect.bottom + topOffset
      );
      setDropdownLeft(targetRect.left);
      setShowDropdown((prevState) => !prevState);
    },
    [dropdownPositions, isLocked, showDropdown, activePath]
  );

  function splitTitleNode(newPath: Path) {
    Transforms.splitNodes(editor);
    Transforms.setNodes(
      editor,
      { id: genNodeId(), type: "paragraph" },
      { at: newPath }
    );
  }

  const insertNewNode = (editor, parentPath, nodeType) => {
    const newPath = Path.next(parentPath);
    const newNode = {
      id: genNodeId(),
      type: nodeType,
      children: [{ text: "" }],
    };
    Transforms.insertNodes(editor, newNode, { at: newPath });
    Transforms.select(editor, newPath);
  };

  const splitNodeAndSetNewId = (editor, newPath) => {
    Transforms.splitNodes(editor);
    const newId = genNodeId();
    Transforms.setNodes(editor, { id: newId }, { at: newPath });
    Transforms.select(editor, Editor.start(editor, newPath));
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const { selection } = editor;

      if (!selection || !ReactEditor.isFocused(editor)) {
        return;
      }

      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event as any)) {
          event.preventDefault();
          const mark = HOTKEYS[hotkey];
          toggleFormat(editor, mark);
        }
      }

      const [parentNode, parentPath] = Editor.parent(
        editor,
        selection.anchor.path
      );

      setIsTyping(true);
      const _currentNodePath = selection.anchor.path.slice(0, -1);

      // setActivePath(JSON.stringify(selection.anchor.path));
      const startPosition = selection.anchor;
      const [currentNode, currentNodePath] = Editor.parent(
        editor,
        startPosition.path
      );

      setIsTyping(currentNode.id);

      let updatedNode = null;

      const isEmpty = currentNode.children[0].text === "";

      const startOfNode = Editor.start(editor, editor.selection);
      const cursorAtStartOfNode =
        Range.isCollapsed(editor.selection) &&
        Point.equals(editor.selection.anchor, startOfNode);
      if (event.nativeEvent.key === "/" && isEmpty && cursorAtStartOfNode) {
        event.preventDefault();
        openMiniDropdown(_currentNodePath);
        setusingCommandLine(true);
      }

      if (/^[a-zA-Z0-9-_]$/.test(event.key)) {
        const currentNode = Editor.node(editor, _currentNodePath);
        const currentText = Node.string(currentNode[0]);

        const slashIndex = currentText.lastIndexOf("/");
        if (slashIndex !== -1) {
          // Extract the text after the last "/" in the currentText
          const searchText = currentText.slice(slashIndex + 1) + event.key;
          console.log(searchText);
          setSearchMinidropdownText(searchText);
        } else {
          setSearchMinidropdownText(null);
        }
      } else {
        setSearchMinidropdownText(null);
      }

      if (event.key === " ") {
        const currentNode = Editor.node(editor, _currentNodePath);
        const currentText = Node.string(currentNode[0]);

        const slashIndex = currentText.lastIndexOf("-");
        if (currentText.startsWith("-")) {
          // Get the current selection in the editor
          const { selection } = editor;

          if (selection) {
            event.preventDefault();
            // Unwrap any existing list items

            if (parentNode.type === "paragraph") {
              toggleBlock(editor, "bulleted-list");
              Transforms.delete(editor, { unit: "character", reverse: true });
              // Transforms.move(editor, { distance: 1, unit: "character" });
              // const start = Editor.start(editor, selection.focus.path);
              // Transforms.select(editor, start);
            }
          }
        }
      }

      if (event.key === "Enter") {
        event.preventDefault();

        if (selection) {
          console.log(parentNode.type);

          if (
            [
              "numbered-list",
              "bulleted-list",
              "checked-list",
              "option-list-item",
            ].includes(parentNode.type)
          ) {
            const newPath = Path.next(parentPath);

            if (
              Node.string(parentNode) === "" &&
              parentNode.type !== "option-list-item"
            ) {
              event.preventDefault();
              Transforms.setNodes(
                editor,
                { type: "paragraph" },
                { at: _currentNodePath }
              );

              Transforms.select(editor, Editor.start(editor, _currentNodePath));
              return;
            }

            if (Editor.isEnd(editor, selection.anchor, _currentNodePath)) {
              insertNewNode(editor, parentPath, parentNode.type);
            }

            if (
              Editor.isStart(editor, editor.selection.anchor, _currentNodePath)
            ) {
              insertNewNode(editor, _currentNodePath, parentNode.type);
            } else {
              splitNodeAndSetNewId(editor, newPath);
            }
          }

          if (
            parentNode.type === "paragraph" ||
            parentNode.type === "heading-one" ||
            parentNode.type === "heading-two" ||
            parentNode.type === "heading-three"
          ) {
            const newPath = Path.next(parentPath);
            if (Editor.isEnd(editor, selection.anchor, _currentNodePath)) {
              // insertNewParagraph(newPath);
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
              Transforms.select(editor, newPath);
            }

            console.log(_currentNodePath);

            if (
              Editor.isStart(editor, editor.selection.anchor, _currentNodePath)
            ) {
              // Get the previous path for the new paragraph
              // Create a new paragraph with an empty text node and a new ID
              const newParagraph = {
                type: "paragraph",
                id: genNodeId(),
                children: [{ text: "" }],
              };

              // Insert the new paragraph at the previous path
              Transforms.insertNodes(editor, newParagraph, {
                at: _currentNodePath,
              });
            } else {
              if (parentNode.type !== "paragraph") {
                splitTitleNode(Path.next(_currentNodePath));
              } else {
                Transforms.splitNodes(editor);
              }

              const newId = genNodeId();
              Transforms.setNodes(editor, { id: newId }, { at: newPath });
              Transforms.select(editor, Editor.start(editor, newPath));
            }
          }

          if (parentNode.type === "title") {
            event.preventDefault();
            const nextNode = Editor.next(editor, { at: parentPath });

            if (
              !nextNode ||
              (nextNode &&
                nextNode[0].type !== "mcq" &&
                nextNode[0].type !== "equation")
            ) {
              if (
                Editor.isStart(
                  editor,
                  editor.selection.anchor,
                  _currentNodePath
                )
              ) {
                const newPath = Path.next(parentPath);
                // Insert an empty paragraph below the title
                Transforms.insertNodes(
                  editor,
                  {
                    id: genNodeId(),
                    type: "paragraph",
                    children: [{ text: "" }],
                  },
                  { at: newPath }
                );
                // Move the content of the title to the new paragraph
                Transforms.moveNodes(editor, {
                  at: [0, 0],
                  to: [1, 0],
                });
                // Set the title node to empty
                // Transforms.insertText(editor, "", { at: [0, 0], select: true });
                // Transforms.setNodes(editor, { type: "title" }, { at: [0] });
              }

              if (Editor.isEnd(editor, selection.anchor, _currentNodePath)) {
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
                Transforms.select(editor, newPath);
              } else {
                const newPath = Path.next(parentPath);
                splitTitleNode(newPath);
              }
            } else {
              // Otherwise, split the nodes and create a new paragraph as before

              if (Editor.isEnd(editor, selection.anchor, _currentNodePath)) {
                const newPath = Path.next(parentPath);
                insertNewParagraph(editor, newPath);
              } else {
                splitTitleNode(parentPath);
              }
            }
          }

          // if (parentNode.type === "option-list-item") {
          //   const newPath = Path.next(parentPath);
          //   const newNode = {
          //     id: genNodeId(),
          //     type: "option-list-item",
          //     children: [{ text: "" }],
          //     correctAnswer: false,
          //   };
          //   Transforms.insertNodes(editor, newNode, { at: newPath });
          //   Transforms.select(editor, Editor.start(editor, newPath));
          //   updatedNode = newNode;
          // }
        }
      }

      if (event.key === "Backspace") {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
          // Do nothing if there is a range selected

          // Get the node before the current selection

          // If the node before the selection is a paragraph, merge the nodes

          const currentNode = Node.get(editor, _currentNodePath);
          const _stringcurrentNode = Editor.node(editor, _currentNodePath);
          const currentText = Node.string(_stringcurrentNode[0]);
          const currentParagraph = Editor.node(editor, _currentNodePath);
          const parentNode = Editor.parent(editor, _currentNodePath);
          // Check if currentNode is an equation

          console.log(currentNode.type);

          if (
            ["numbered-list", "bulleted-list", "checked-list"].includes(
              currentNode.type
            )
          ) {
            let newProperties = {
              type: "paragraph",
            };

            const backToParagraph =
              currentNode.children[0].text === "" ||
              Editor.isStart(editor, editor.selection.anchor, _currentNodePath);

            if (backToParagraph) {
              event.preventDefault();
              // Transforms.setNodes(editor, newProperties);
              toggleBlock(editor, "paragraph");
            }
          }

          // Check if the current node is a paragraph and the cursor is at the start

          if (currentNode.type === "paragraph") {
            const prevNodeEntry = Editor.previous(editor, {
              at: _currentNodePath,
            });

            if (prevNodeEntry) {
              const [_prevNode] = prevNodeEntry;

              const isStart = Editor.isStart(
                editor,
                selection.anchor,
                _currentNodePath
              );

              if (
                (_prevNode.type === "mcq" && isStart) ||
                (_prevNode.type === "slide" && isStart) ||
                (_prevNode.type === "equation" && isStart)
              ) {
                event.preventDefault();
                const nextParagraph = Editor.previous(editor, {
                  at: _currentNodePath,
                  match: (n) => n.type === "paragraph",
                });

                if (nextParagraph) {
                  const [nextNode, nextPath] = nextParagraph;
                  const targetPosition = Editor.end(editor, nextPath);
                  Transforms.select(editor, targetPosition);
                }
              }

              if (
                Node.string(_prevNode) === "" &&
                _prevNode.type !== "paragraph" &&
                isStart
              ) {
                event.preventDefault();
                const heading = Editor.previous(editor, {
                  at: _currentNodePath,
                });

                if (heading) {
                  const [nextNode, nextPath] = heading;
                  const targetPosition = Editor.end(editor, nextPath);
                  Transforms.select(editor, targetPosition);
                }
              }
            }
          }

          // if (currentNode.type === "equation" || currentNode.type === "audio") {
          //   event.preventDefault();
          // } else {
          //   // Check if the previous node is an equation
          //   const prevNodeEntry = Editor.previous(editor, {
          //     at: _currentNodePath,
          //   });

          //   if (prevNodeEntry) {
          //     const [_prevNode] = prevNodeEntry;

          //     if (
          //       (_prevNode.type === "equation" || _prevNode.type === "audio") &&
          //       Editor.isStart(editor, selection.anchor, _currentNodePath)
          //     ) {
          //       event.preventDefault();
          //       const nextParagraph = Editor.previous(editor, {
          //         at: currentParagraph[1],
          //         match: (n) => n.type === "paragraph",
          //       });
          //       if (nextParagraph) {
          //         const [nextNode, nextPath] = nextParagraph;
          //         const targetPosition = Editor.end(editor, nextPath);
          //         Transforms.select(editor, targetPosition);
          //       }
          //     }
          //   }
          // }

          if (currentNode.type === "list-item") {
            const parentNode = Editor.parent(editor, currentNodePath);
            if (parentNode[0].type === "mcq") {
              // Check if the list-item text is empty
              const isEmpty =
                currentNode.children.length === 1 &&
                currentNode.children[0].text === "";
              if (isEmpty) {
                event.preventDefault();
              }
            }
          }

          if (
            (currentNode.type === "option-list-item" || updatedNode) &&
            parentNode[0].type === "mcq"
          ) {
            const optionListItems = parentNode[0].children.filter(
              (child) => child.type === "option-list-item"
            );

            if (optionListItems.length <= 2) {
              const isEmpty =
                (currentNode.children.length === 1 &&
                  currentNode.children[0].text === "") ||
                (updatedNode && updatedNode.children[0].text === "");
              if (isEmpty) {
                event.preventDefault();
              }
            }
          }

          if (currentNode.type === "question-item") {
            const isFirstQuestionItem =
              parentNode[0].children[0] === currentNode;
            if (
              isFirstQuestionItem &&
              Editor.isStart(editor, editor.selection.anchor, _currentNodePath)
            ) {
              event.preventDefault();
            }
          }

          if (currentNode.type === "option-list-item") {
            const isFirstQuestionItem =
              parentNode[0].children[0] === currentNode;
            if (
              isFirstQuestionItem &&
              Editor.isStart(editor, editor.selection.anchor, _currentNodePath)
            ) {
              event.preventDefault();
            }
          }
        }
      }

      // if (
      //   event.key === "_" &&
      //   event.shiftKey &&
      //   !event.ctrlKey &&
      //   !event.altKey
      // ) {
      //   const { selection } = editor;
      //   if (selection && Range.isCollapsed(selection)) {
      //     const [startTextNode, startPath] = Editor.node(
      //       editor,
      //       selection.anchor.path
      //     );

      //     if (startTextNode.text) {
      //       const textBeforeCaret = startTextNode.text.slice(
      //         0,
      //         selection.anchor.offset
      //       );
      //       const underscoreMatches = textBeforeCaret.match(/_{2,}$/);

      //       if (underscoreMatches) {
      //         event.preventDefault();

      //         const numberOfUnderscores = underscoreMatches[0].length;
      //         const textBeforeUnderscores = startTextNode.text.slice(
      //           0,
      //           selection.anchor.offset - numberOfUnderscores
      //         );
      //         const textAfterCaret = startTextNode.text.slice(
      //           selection.anchor.offset
      //         );

      //         const newChildren = [
      //           { text: textBeforeUnderscores },
      //           { text: " ", blank: true },
      //           { text: " " },
      //           { text: textAfterCaret },
      //         ];

      //         const parentNodePath = startPath.slice(0, -1);
      //         const [parentNode, _] = Editor.node(editor, parentNodePath);

      //         const newNode = {
      //           ...parentNode,
      //           children: parentNode.children
      //             .slice(0, startPath[startPath.length - 1])
      //             .concat(newChildren)
      //             .concat(
      //               parentNode.children.slice(
      //                 startPath[startPath.length - 1] + 1
      //               )
      //             ),
      //         };

      //         const textNodePoint = {
      //           path: startPath
      //             .slice(0, -1)
      //             .concat(startPath[startPath.length - 1] + 1),
      //           offset: 0,
      //         };

      //         Editor.withoutNormalizing(editor, () => {
      //           Transforms.removeNodes(editor, { at: parentNodePath });
      //           Transforms.insertNodes(editor, newNode, { at: parentNodePath });
      //         });

      //         Transforms.select(editor, textNodePoint);
      //       }
      //     }
      //   }
      // }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "z": {
            event.preventDefault();
            if (event.shiftKey) {
              // Redo
              editor.redo();
            } else {
              // Undo
              editor.undo();
            }
            break;
          }
          case "y": {
            if (!event.shiftKey) {
              event.preventDefault();
              // Redo
              editor.redo();
            }
            break;
          }
          default:
            break;
        }
      }
    },
    [editor]
  );

  const handleEditLatex = (value: string, altText: string, path: Path) => {
    const latex = value;
    const equationNode = {
      type: "equation",
      latex,
      altText,
      children: [{ text: "" }],
    };

    console.log(altText);

    Transforms.setNodes(editor, equationNode, { at: path });
    console.log(path);
    const currentElement = document.querySelector(
      `[data-path="${JSON.stringify(path)}"]`
    );
    console.log(currentElement);
  };

  const [getCurrentLatex, setCurrentLatex] = useState("");
  const [equationHeight, setEquationHeight] = useState<number | null>(null);

  const openEditBlockPopup = (
    _element: HTMLElement,
    event: React.MouseEvent,
    path: Path
  ) => {
    event.stopPropagation();
    const targetRect = _element.getBoundingClientRect();

    console.log(targetRect.left);
    const currentPathString = JSON.stringify(path);
    setActivePath(currentPathString);
    const spaceBelowTarget = window.innerHeight - targetRect.top;
    const [currentNode] = Editor.node(editor, path);

    setCurrentLatex(currentNode.latex);
    setSelectedElementID(currentNode.id);
    console.log(currentNode.id);

    // setSelectedElementID();
    setShowEditBlockPopup({
      open: true,
      element: "equation",
    });
    // let topOffset;
    // let showDropdownAbove = false;
    // console.log(spaceBelowTarget);
    // const dropdownHeight = 280;
    // if (spaceBelowTarget < dropdownHeight) {
    //   topOffset = -(dropdownHeight - targetRect.height) + 10;
    //   showDropdownAbove = true;
    // }
    // setSearchBarPosition(spaceBelowTarget < dropdownHeight);

    // const equationHeight = _element.offsetHeight;
    // setDropdownEditBlockTop(
    //   showDropdownAbove ? targetRect.top + topOffset : targetRect.bottom - 5
    // );
    // setDropdownEditBlockLeft(targetRect.left);
  };

  const toggleRef = useRef<HTMLButtonElement>(null);
  const toggleEditBlockRef = useRef<HTMLElement>(null);

  const [addButtonHoveredId, setAddButtonHoveredId] = useState(null);

  const handleAddMCQBlock = useCallback((path: Path) => {
    setSearchMinidropdownText("");
    addMCQBlock(editor, path);
  }, []);

  const handleAddEditableEquationBlock = useCallback(
    (latex: string, path: Path) => {
      const { newPath, id } = addEditableEquationBlock(latex, editor, path);

      setShowEditBlockPopup({
        open: true,
        element: "equation",
      });
      setActivePath(JSON.stringify(newPath));

      // const { id } = insertedEquationNode[0] as CustomElement;
      // console.log(id);
      setSelectedElementID(id);

      setCurrentLatex("");
    },
    []
  );

  useLayoutEffect(() => {
    if (showEditBlockPopup.open && activePath) {
      const currentElement = document.querySelector(
        `[data-id="${selectedElementID}"]`
      );
      console.log(currentElement);
      if (currentElement) {
        const targetRect = currentElement.getBoundingClientRect();
        const spaceBelowTarget = window.innerHeight - targetRect.top;

        let topOffset;
        let showDropdownAbove = false;
        console.log(spaceBelowTarget);
        const dropdownHeight =
          showEditBlockPopup.element === "equation" ? 280 : 180;
        if (spaceBelowTarget < dropdownHeight) {
          topOffset = -(dropdownHeight - targetRect.height) + 10;
          showDropdownAbove = true;
        }
        setSearchBarPosition(spaceBelowTarget < dropdownHeight);

        setDropdownEditBlockTop(
          showDropdownAbove ? targetRect.top + topOffset : targetRect.bottom - 5
        );
        setDropdownEditBlockLeft(targetRect.left);

        console.log(targetRect.left);
      }
    }
  }, [showEditBlockPopup, selectedElementID]);

  const [isTyping, setIsTyping] = useState("");
  const debouncedSetIsTyping = debounce(setIsTyping, 1000);
  const MemoizedElementSelector = React.memo(ElementSelector);

  const elementRefs = new WeakMap();

  const renderElement = useCallback(
    (
      props: JSX.IntrinsicAttributes & {
        attributes: any;
        children: any;
        element: any;
        renderElement: any;
      }
    ) => {
      const { attributes, children, element } = props;

      const elementPath = ReactEditor.findPath(editor, element);
      const isRoot = elementPath.length === 1;

      if (!elementPath) return;

      const [parentElement, parentPath] = Editor.parent(editor, elementPath);
      const isInsideColumnCell =
        parentElement.type === "column-cell" || parentElement.type === "tts";

      const addButton =
        (isRoot &&
          element.type !== "column" &&
          element.type !== "image" &&
          element.type !== "title") ||
        isInsideColumnCell ? (
          <div className="z-1000" contentEditable={false}>
            <button
              className="addButton flex h-[24px] w-[24px] items-center justify-center rounded-md ease-in-out hover:bg-gray-300 dark:hover:bg-accent"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                openMiniDropdown(ReactEditor.findPath(editor, element));
                ReactEditor.blur(editor);
              }}
              ref={toggleRef}
            >
              <Plus
                className="stroke-muted-foreground dark:stroke-muted-foreground"
                width={20}
              />
            </button>
          </div>
        ) : null;
      if (!elementRefs.has(element)) {
        elementRefs.set(element, React.createRef());
      }
      const optionMenuRef = elementRefs.get(element);

      const optionMenu =
        isRoot || parentElement.type === "tts" ? (
          <div className="flex w-[30px] ">
            <div className="absolute   top-0 right-[10px]  items-center">
              <OptionMenu element={element} ref={optionMenuRef} />
            </div>
          </div>
        ) : null;

      const shouldWrapWithSortableElement =
        (isRoot &&
          element.type !== "column" &&
          element.type !== "tts" &&
          element.type !== "title") ||
        isInsideColumnCell;

      const content = shouldWrapWithSortableElement ? (
        <SortableElement
          {...props}
          addButton={addButton}
          optionMenu={optionMenu}
          renderElement={(props: any) => <MemoizedElementSelector {...props} />}
        />
      ) : (
        <MemoizedElementSelector {...props} />
      );

      return <>{content}</>;
    },
    []
  );

  const [insertDirection, setInsertDirection] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [savedSelection, setSavedSelection] = useState(null);
  const textEditorRef = useRef(null);

  const handleDragEnd = useCallback(
    function (event: { active: any; over: any }) {
      const { active, over } = event;

      if (!active || !over) {
        console.log("Active or over are not defined");
        return;
      }

      if (active.id === over.id) {
        console.log("canceled");

        setIsDragging(false);
        console.log(event);
        const activeElementPath = findPathById(editor, active.id);
        console.log(activeElementPath);
        if (activeElementPath) {
          const endOfActiveElement = Editor.end(editor, activeElementPath);
          ReactEditor.focus(editor);
          Transforms.select(editor, endOfActiveElement);
        }
        setActiveId(null);
        return;
      }

      // Find the nodes using the ir IDs
      // setSelectedElementID(active.id);

      console.log("active", active.id, "over", over.id);
      const fromPath = findPathById(editor, active.id);
      const toPath = findPathById(editor, over.id);

      console.log("toPath", toPath);

      const [fromParentElement, fromParentPath] = Editor.parent(
        editor,
        fromPath
      );

      console.log(fromParentPath);
      const [toParentElement, toParentPath] = Editor.parent(editor, toPath);

      // Check if the dragged element should be inserted before or after the target element
      const toIndexOffset =
        fromParentPath.join() === toParentPath.join() &&
        fromParentPath[fromParentPath.length - 1] <
          toParentPath[toParentPath.length - 1]
          ? 1
          : 0;

      const isRootLevel = fromPath.length === 1 && toPath.length === 1;

      console.log("fromPath", fromPath[0], toPath[0]);
      // console.log(isRootLevel, creatingNewColumn);
      if (isRootLevel && creatingNewColumn) {
        // Adjust the over object according to the insertDirection
        const targetPath =
          insertDirection === "left"
            ? toPath.slice(0, -1)
            : insertDirection === "right"
            ? toPath
            : toPath
                .slice(0, -1)
                .concat(toPath[toPath.length - 1] + toIndexOffset);

        createColumns(fromPath, { id: over.id, path: targetPath }, editor);
      } else if (
        fromParentElement.type === "column-cell" &&
        toParentElement.type === "column-cell"
      ) {
        Transforms.moveNodes(editor, {
          at: fromPath,
          to: toPath
            .slice(0, -1)
            .concat(toPath[toPath.length - 1] + toIndexOffset),
        });
      } else {
        Transforms.moveNodes(editor, {
          at: fromPath,
          to: toParentPath.concat(toPath[toPath.length - 1] + toIndexOffset),
        });
      }

      const ifParentPathIsGreater = fromPath[0] > toPath[0];

      const newParentPath = ifParentPathIsGreater
        ? [fromParentPath[0] + 1, ...fromParentPath.slice(1)]
        : fromParentPath;
      if (
        fromParentElement.type === "column-cell" &&
        fromParentElement.children.length === 1
      ) {
        Transforms.removeNodes(editor, { at: newParentPath });

        const [columnElement, columnPath] = Editor.parent(
          editor,
          newParentPath
        );

        console.log(columnPath);

        console.log(columnElement.children);
        if (
          columnElement.type === "column" &&
          columnElement.children.length === 1 &&
          columnElement.children[0]?.text === ""
        ) {
          Transforms.removeNodes(editor, { at: columnPath });
        }
      }

      // setCheckEmptyColumnCells((prevCheck) => !prevCheck);
      setActiveId(null);
    },
    [editor, creatingNewColumn, activeId]
  );

  function Droppable({ children }) {
    const droppable = useDroppable({
      id: "droppable-area",
    });

    useDndMonitor({
      onDragOver(event) {
        const { active, over } = event;
        if (!over) {
          setCreatingNewColumn(false);
          setInsertDirection(null);
          return;
        }

        const activePath = findPathById(editor, active.id);
        const overPath = findPathById(editor, over.id);

        if (activePath && overPath) {
          const isNearRoot = activePath.length === 1 && overPath.length === 1;

          const overNode = Node.get(editor, overPath);

          if (overNode.type === "slide") {
            setCreatingNewColumn(false);
            setInsertDirection(null);
            return;
          }

          if (isNearRoot) {
            const overElement = document.querySelector(
              `[data-id="${over.id}"]`
            );

            if (!overElement) return;
            const overRect = overElement.getBoundingClientRect();

            const cursorX = event.delta.x;

            // const isCloseToLeft =
            //   cursorX < overRect.left + overRect.width * 0.5;
            const isCloseToRight =
              cursorX > overRect.left + overRect.width * 0.4;

            console.log(cursorX, overRect.left + overRect.width * 0.4);

            if (isCloseToRight) {
              setCreatingNewColumn(true);
              // setInsertDirection("right");
            } else {
              setCreatingNewColumn(false);
            }
          }
        } else {
          setCreatingNewColumn(false);
          setInsertDirection(null);
        }
      },
    });

    return (
      <div ref={droppable.setNodeRef} {...droppable.attributes}>
        {children}
      </div>
    );
  }

  const handleDragStart = useCallback(function ({ active }) {
    console.log(active.id);
    setActiveId(active.id);
    setIsDragging(true);
    setSavedSelection(editor.selection);
  }, []);

  useClickOutside(
    addSomethingDropdownRef,
    () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    },
    toggleRef
  );

  useClickOutside(
    editBlockDropdownRef,
    () => {
      if (showEditBlockPopup) {
        setShowEditBlockPopup({
          open: false,
          element: null,
        });
        setActivePath("");
      }
    },
    toggleEditBlockRef
  );

  const closeEditableDropdown = () => {
    if (showEditBlockPopup) {
      setShowEditBlockPopup({
        open: false,
        element: null,
      });
      setactiveEditEquationPath(null);
    }
  };

  function handleEditorMouseUp(
    event: React.MouseEvent<globalThis.Element, MouseEvent>,
    editor: ReactEditor
  ) {
    const equationElement = findAncestorWithClass(
      event.target,
      "equation-element"
    );
    if (equationElement) {
      const pathString = equationElement.getAttribute("data-path");
      if (pathString) {
        const path = JSON.parse(pathString);
        // setActivePath(pathString);
        openEditBlockPopup(equationElement, event, path);
        return;
      }
    }

    const selection = document.getSelection();
    if (
      !selection ||
      !selection.anchorNode ||
      !ReactEditor.hasDOMNode(editor, selection.anchorNode)
    ) {
      return;
    }

    const lastNode = editor.children[editor.children.length - 1];
    const lastNodePath = ReactEditor.findPath(editor, lastNode);

    // if (
    //   lastNode.type === "equation" ||
    //   lastNode.type === "audio" ||
    //   lastNode.type === "slide"
    // ) {
    //   insertNewParagraphBelowLastNode(lastNodePath);
    //   event.stopPropagation();
    //   return;
    // }

    const lastNodeDOM = document.querySelector(
      `[data-path="${JSON.stringify(lastNodePath)}"]`
    );
    const lastNodeRect = lastNodeDOM.getBoundingClientRect();
    const clickedY = event.clientY;
    const isLastNodeEmpty =
      lastNode.children.length === 1 && lastNode.children[0].text === "";
    if (clickedY > lastNodeRect.bottom && !isLastNodeEmpty) {
      insertNewParagraphBelowLastNode(lastNodePath);
      event.stopPropagation();
    }
  }

  function insertNewParagraphBelowLastNode(lastNodePath: string | any[]) {
    const newParagraph = {
      id: genNodeId(),
      type: "paragraph",
      children: [{ text: "" }],
    };
    const newPath = lastNodePath
      .slice(0, -1)
      .concat(lastNodePath[lastNodePath.length - 1] + 1);
    Transforms.insertNodes(editor, newParagraph, { at: newPath });
    const leafNodePath = newPath.concat(0);
    Transforms.select(editor, Editor.start(editor, newPath));
  }

  const renderSubjectComponent = () => {
    switch (showFloatingModal.subject) {
      case "math":
        return <MathQuestionGenerator />;
      case "english":
        return <EnglishQuestionGenerator />;
      // Add more cases for other subjects here
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (showFloatingModal.subject) {
      case "math":
        return "Math Questions";
      case "english":
        return "English Questions";
      // Add more cases for other subjects here
      default:
        return "Homework Creator";
    }
  };

  const toolbarRef = useRef(null);
  useClickOutside(
    toolbarRef,
    () => {
      if (showMiniToolbar) {
        setShowMiniToolbar(false);
        setToolbarWidth(200);
        setOpenLink(false);
      }
    },
    textEditorRef
  );
  const [dynamicToolbarWidth, setToolbarWidth] = useState(200);
  const [openLink, setOpenLink] = useState(false);
  const [lastActiveSelection, setLastActiveSelection] = useState<Range>();

  useEffect(() => {
    console.log(editor.selection);
    if (editor.selection != null) setLastActiveSelection(editor.selection);
  }, [editor.selection]);

  const decorate = ([node, path]) => {
    if (node.type === "title") return [];
    if (lastActiveSelection != null) {
      const intersection = Range.intersection(
        lastActiveSelection,
        Editor.range(editor, path)
      );

      if (intersection == null) {
        return [];
      }

      const range = {
        highlighted: true,
        ...intersection,
      };

      return [range];
    }
    return [];
  };

  const handleSelectedText = debounce(
    useCallback(
      (
        event:
          | React.KeyboardEvent<HTMLDivElement>
          | React.MouseEvent<HTMLDivElement, MouseEvent>,
        editor: BaseEditor & ReactEditor
      ) => {
        event.stopPropagation();

        const { selection } = editor;
        if (selection) {
          const _currentNodePath = selection.anchor.path.slice(0, -1);
          // console.log(_currentNodePath);
          setActivePath(JSON.stringify(_currentNodePath));
        }
        if (selection && !Range.isCollapsed(selection)) {
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const startContainer = range.startContainer;
            const endContainer = range.endContainer;
            const endOffset = range.endOffset;

            if (
              startContainer.nodeType === startContainer.TEXT_NODE &&
              endContainer.nodeType === endContainer.TEXT_NODE
            ) {
              const startPath = Editor.path(editor, selection, {
                edge: "start",
              });
              const [startNode] = Editor.parent(editor, startPath);

              if (
                startNode.type === "paragraph" ||
                startNode.type === "link" ||
                startNode.type === "bulleted-list" ||
                startNode.type === "numbered-list" ||
                startNode.type === "checked-list" ||
                startNode.type === "heading-one" ||
                startNode.type === "heading-two" ||
                startNode.type === "heading-three"
              ) {
                const startRange = document.createRange();
                startRange.setStart(startContainer, range.startOffset);
                startRange.setEnd(startContainer, range.startOffset);
                const startRect = startRange.getBoundingClientRect();

                const endRange = document.createRange();
                endRange.setStart(endContainer, endOffset);
                endRange.setEnd(endContainer, endOffset);
                const endRect = endRange.getBoundingClientRect();

                const selectionRect = range.getBoundingClientRect();

                // Get the text editor's dimensions
                const textEditorRect =
                  textEditorRef.current.getBoundingClientRect();
                const textEditorWidth = textEditorRect.width;
                const textEditorLeft = textEditorRect.left;

                // Get all rectangles that make up the selection
                const rects = range.getClientRects();
                const firstRect = rects[0];

                // Calculate mini toolbar position
                const toolbarWidth = isParentTTS(editor) ? 370 : 480; // Update this value according to your toolbar width
                let initialX = firstRect.left - textEditorLeft;

                const x = Math.max(
                  Math.min(initialX, textEditorWidth - toolbarWidth - 20),
                  0
                );

                setMiniToolbarPosition({
                  x: x,
                  y:
                    firstRect.top -
                    window.scrollY -
                    textEditorRect.top -
                    60 +
                    textEditorRef.current.scrollTop,
                });
                setShowMiniToolbar(true);

                const selectedText = Editor.string(editor, selection);
                const extractedText = textRegex(selectedText);
              }
            }
          }
        } else {
          setShowMiniToolbar(false);
          setOpenLink(false);
        }
      },
      [dynamicToolbarWidth]
    ),
    300
  );

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { showRightSidebar, setShowRightSidebar } = useTextSpeech();

  const [rightSideBarWidth, setRightSideBarWidth] = useLocalStorage(
    "sidebarWidth",
    340
  );

  const minSidebarWidth = 340;
  const maxSidebarWidth = 570;
  const { elementWidth, handleDrag, isDraggingRightSideBar, handleDragStop } =
    useResizeSidebar(rightSideBarWidth, minSidebarWidth, maxSidebarWidth);

  useEffect(() => {
    localStorage.setItem("showRightSidebar", JSON.stringify(showRightSidebar));
  }, [showRightSidebar]);

  useEffect(() => {
    localStorage.setItem("sidebarWidth", elementWidth);
    if (windowSize.width > breakpoints.xl) {
      setRightSideBarWidth(elementWidth);
    } else {
      setRightSideBarWidth(370);
    }
  }, [elementWidth, windowSize]);

  return (
    <div
      className="relative mx-auto mt-[40px] lg:max-w-[1000px] xl:max-w-[1400px]"
      style={{
        width:
          windowSize.width > breakpoints.xl
            ? `${rightSideBarWidth + 800}px`
            : "95vw",
      }}
    >
      <Portal>
        <button
          className="group fixed right-[30px] top-[30px] z-0 hidden rounded  border-gray-300 p-1 transition duration-300 hover:border-brand dark:border-gray-700 dark:hover:border-foreground dark:hover:bg-muted lg:block"
          onClick={() => {
            setShowRightSidebar((prev) => !prev);
          }}
        >
          {!showRightSidebar ? (
            <VscLayoutSidebarRightOff className="  h-[20px] w-[20px] text-darkergray transition duration-300 group-hover:text-brand dark:text-muted-foreground dark:group-hover:text-foreground" />
          ) : (
            <VscLayoutSidebarRight className="  h-[20px] w-[20px] text-darkergray transition duration-300 group-hover:text-brand dark:text-muted-foreground dark:group-hover:text-foreground" />
          )}
        </button>
      </Portal>
      <div className="flex  lg:justify-center xl:px-4">
        <div className="mx-auto block">
          <div
            className="relative  z-0  mt-2 rounded-md  border border-gray-300  bg-white px-2 dark:border-gray-700 dark:bg-muted dark:text-foreground lg:min-w-[600px] lg:px-0 xl:min-w-[800px]"
            style={{
              right:
                windowSize.width > breakpoints.lg
                  ? !showRightSidebar
                    ? -(rightSideBarWidth / 2)
                    : 0
                  : 0,
              maxWidth: "800px",
              width:
                windowSize.width > breakpoints.lg
                  ? showRightSidebar
                    ? "50vw"
                    : "100vw"
                  : "95vw",
              height: "calc(100vh - 120px)",
              transition: "right 0.3s ease-in-out, width 0.3s ease-in-out",
            }}
          >
            <div className="block  lg:w-full">
              <ErrorBoundary>
                <DndContext
                  onDragEnd={handleDragEnd}
                  onDragStart={handleDragStart}
                  sensors={sensors}
                >
                  <SortableContext
                    items={slatevalue}
                    strategy={verticalListSortingStrategy}
                  >
                    <ActiveElementProvider activeIndex={activeIndex}>
                      <EditableStyle>
                        <div
                          ref={textEditorRef}
                          tabIndex={0}
                          className="editable-scrollbar relative z-0 mx-auto block overflow-y-auto  overflow-x-hidden rounded-md pt-4 pb-4 focus:outline-none  focus-visible:border-gray-300"
                        >
                          <Slate
                            key={currentSlateKey}
                            editor={editor}
                            value={slatevalue}
                            onChange={(newValue) => {
                              if (!isEqual(slatevalue, newValue)) {
                                // Compare the current and new values
                                debouncedSetSlateValue(newValue);

                                console.log("hello");
                                console.log(JSON.stringify(newValue));
                                if (handleTextChange) {
                                  handleTextChange(newValue);
                                }
                              }
                            }}
                          >
                            <Droppable>
                              <Editable
                                className=" relative"
                                style={{
                                  height: "calc(100vh - 170px)",
                                }}
                                decorate={decorate}
                                renderElement={renderElement}
                                renderLeaf={Leaf}
                                onMouseUp={(event) => {
                                  handleEditorMouseUp(event, editor);
                                  handleSelectedText(event, editor);
                                }}
                                spellCheck={false}
                                onKeyDown={handleKeyDown}
                                onKeyUp={(event) => {
                                  handleSelectedText(event, editor);
                                  debouncedSetIsTyping("");

                                  const { selection } = editor;
                                  if (!selection) return;
                                  const _currentNodePath =
                                    selection.anchor.path.slice(0, -1);
                                  setusingCommandLine(false);
                                  const currentNode = Node.get(
                                    editor,
                                    _currentNodePath
                                  );

                                  if (event.key === "Backspace") {
                                    const { selection } = editor;

                                    if (
                                      selection &&
                                      Range.isCollapsed(selection)
                                    ) {
                                      const _currentNodePath =
                                        selection.anchor.path.slice(0, -1);
                                      const _stringcurrentNode = Editor.node(
                                        editor,
                                        _currentNodePath
                                      );
                                      const currentText = Node.string(
                                        _stringcurrentNode[0]
                                      );
                                      // Check if currentNode is an equation

                                      if (currentText.endsWith("/")) {
                                        // setShowDropdown(false);
                                        setSearchMinidropdownText("");
                                      } else {
                                        const slashIndex =
                                          currentText.lastIndexOf("/");
                                        if (slashIndex !== -1) {
                                          // Extract the text after the last "/" in the currentText
                                          const searchText = currentText.slice(
                                            slashIndex + 1
                                          );
                                          setSearchMinidropdownText(searchText);
                                        } else {
                                          setSearchMinidropdownText("");
                                          setusingCommandLine(false);
                                          setShowDropdown(false); // Close the mini-dropdown if there's no "/"
                                        }
                                      }
                                    }
                                  }
                                }}
                              />
                            </Droppable>
                          </Slate>
                          <AnimatePresence>
                            {showMiniToolbar && (
                              <StyledMiniToolbar
                                className=" rounded-lg border bg-white shadow-md shadow-gray-900 dark:border-gray-500 dark:bg-secondary dark:shadow-background"
                                ref={toolbarRef}
                                {...up_animation_props}
                                exit={{ opacity: 0 }}
                                style={{
                                  top: miniToolbarPosition.y,
                                  left: miniToolbarPosition.x,
                                }}
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                }}
                              >
                                <Toolbar
                                  showMiniToolbar={showMiniToolbar}
                                  openLink={openLink}
                                  setOpenLink={setOpenLink}
                                  setShowMiniToolbar={setShowMiniToolbar}
                                />
                                {/* <TextSpeech key="selectedText" isSelected={true} /> */}
                              </StyledMiniToolbar>
                            )}
                          </AnimatePresence>
                        </div>
                      </EditableStyle>
                    </ActiveElementProvider>
                  </SortableContext>
                  {isDragging && (
                    <DragOverlay>
                      {activeId ? (
                        <DragOverlayContent
                          element={findElementInSlateValue(
                            slatevalue,
                            activeId
                          )}
                        />
                      ) : null}
                    </DragOverlay>
                  )}
                </DndContext>
              </ErrorBoundary>
              <AnimatePresence>
                {showDropdown && activePath && (
                  <motion.div
                    // {...y_animation_props}
                    {...slightbouncey}
                    className="fixed left-[120px] z-10 mx-auto mt-2 block w-[320px]"
                    style={{
                      transformOrigin: "top left",
                      top: `${dropdownTop}px`,
                      left: `${dropdownLeft}px`,
                    }}
                    ref={addSomethingDropdownRef}
                  >
                    <MiniDropdown
                      isOpen={showDropdown}
                      addMCQBlock={() => {
                        handleAddMCQBlock(JSON.parse(activePath));
                        setShowDropdown(false);
                      }}
                      addEquationBlock={() => {
                        handleAddEditableEquationBlock(
                          "",
                          JSON.parse(activePath)
                        );
                        setShowDropdown(false);
                      }}
                      genBlock={(_subject) => {
                        console.log("add block");
                        setShowFloatingModal({ open: true, subject: _subject });
                        setShowDropdown(false);
                      }}
                      setShowDropdown={setShowDropdown}
                      activePath={activePath}
                      searchBarPosition={searchBarPosition}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {showEditBlockPopup.open && activePath && (
                  <>
                    <motion.div
                      {...y_animation_props}
                      className="fixed  z-10 z-10 mx-auto mt-2 mt-2 w-[380px]"
                      style={{
                        top: `${dropdownEditBlockTop}px`,
                        left: `${dropdownEditBlockLeft}px`,
                      }}
                    >
                      {showEditBlockPopup.element === "equation" ? (
                        <EditBlockPopup
                          ref={editBlockDropdownRef}
                          onChange={(latex, altText) =>
                            handleEditLatex(
                              latex,
                              altText,
                              JSON.parse(activePath)
                            )
                          }
                          latexValue={getCurrentLatex}
                          onClick={closeEditableDropdown}
                          insertText={(note) => {
                            Transforms.insertNodes(
                              editor,
                              {
                                id: genNodeId(),
                                type: "paragraph",
                                children: [{ text: note }],
                              },
                              {
                                at: Path.next(JSON.parse(activePath)),
                              }
                            );
                          }}
                        />
                      ) : (
                        <div
                          ref={editBlockDropdownRef}
                          className="z-100 rounded-lg border p-1 dark:border-gray-700  dark:border-gray-700 dark:bg-muted dark:text-foreground lg:w-[400px] xl:w-[500px]"
                        >
                          <ImageEmbedLink />
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              {showFloatingModal.open && (
                <FloatingModal
                  title={getModalTitle()}
                  initialX={dropdownLeft}
                  initialY={dropdownTop}
                  onClose={() =>
                    setShowFloatingModal({ open: false, subject: "" })
                  }
                >
                  {renderSubjectComponent()}
                </FloatingModal>
              )}
            </div>
          </div>
        </div>
        <>
          <div
            style={{
              opacity: showRightSidebar ? "1" : "0",
              pointerEvents: showRightSidebar ? "auto" : "none",
            }}
            className="flex items-center"
          >
            <DraggableCore onDrag={handleDrag} onStop={handleDragStop}>
              <div
                className={` pointer-events-none w-[22px] opacity-0 ${
                  isDraggingRightSideBar && "opacity-100"
                } flex items-center opacity-0 transition duration-300 xl:pointer-events-auto xl:hover:opacity-100 `}
                style={{
                  height: "calc(100vh - 120px)",
                }}
              >
                <div className="mx-auto mt-4 block h-[200px] w-[8px]  cursor-col-resize rounded bg-[#b4b4b4] dark:bg-muted-foreground"></div>
              </div>
            </DraggableCore>
          </div>
          <RightSideBar
            showRightSidebar={showRightSidebar}
            rightSideBarWidth={rightSideBarWidth}
          />
        </>
      </div>
    </div>
  );
};

export default DocumentEditor;
