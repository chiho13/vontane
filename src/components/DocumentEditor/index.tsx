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

import { useEditor } from "@/hooks/useEditor";
import { ActiveElementProvider } from "@/contexts/ActiveElementContext";
import { SortableElement } from "./SortableElement";
import { ElementSelector } from "./EditorElements";
import { EquationProvider } from "@/contexts/EquationEditContext";
import { DragOverlayContent } from "./DragOverlayContent";

import { findAncestorWithClass } from "@/utils/findAncestors";

import { useNewColumn } from "@/contexts/NewColumnContext";
import { useSensor, useSensors, MouseSensor } from "@dnd-kit/core";

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

const EquationContext = createContext(null);

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

import { EditBlockPopup } from "../EditEquationBlock";

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
      children: [{ text: "sdfsfdsf" }],
    },
    {
      id: genNodeId(),
      type: "column",
      children: [
        {
          id: genNodeId(),
          type: "column-cell",
          children: [
            {
              id: genNodeId(),
              type: "paragraph",
              children: [{ text: "Paragraph 1 in column 1" }],
            },
            {
              id: genNodeId(),
              type: "paragraph",
              children: [{ text: "Paragraph 2 in column 1" }],
            },
          ],
        },
        {
          id: genNodeId(),
          type: "column-cell",
          children: [
            {
              id: genNodeId(),
              type: "paragraph",
              children: [{ text: "Paragraph 1 in column 2" }],
            },
            {
              id: genNodeId(),
              type: "paragraph",
              children: [{ text: "Paragraph 2 in column 2" }],
            },
          ],
        },
      ],
    },
    {
      id: genNodeId(),
      type: "paragraph",
      children: [{ text: "gloovi9e" }],
    },
    {
      id: genNodeId(),
      type: "paragraph",
      children: [{ text: "lolololol" }],
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

  const [dropdownTop, setDropdownTop] = useState<number | null>(0);
  const [dropdownLeft, setDropdownLeft] = useState<number | null>(0);

  const [dropdownEditBlockTop, setDropdownEditBlockTop] = useState<
    number | null
  >(0);
  const [dropdownEditBlockLeft, setDropdownEditBlockLeft] = useState<
    number | null
  >(0);

  const [editorKey, setEditorKey] = useState(Date.now());

  const { creatingNewColumn, setCreatingNewColumn } = useNewColumn();

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
          { id: genNodeId(), type: "paragraph", children: [{ text: "" }] },
          { at: Path.next(path) }
        );

        setDropdownTop(targetRect.bottom + 50);
      } else {
        setDropdownTop(targetRect.bottom + 30);
      }

      setDropdownLeft(targetRect.left + 60);
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

    if (event.key === "Backspace") {
      const { selection } = editor;

      if (selection && Range.isCollapsed(selection)) {
        const _currentNodePath = selection.anchor.path.slice(0, -1);
        const currentNode = Node.get(editor, currentNodePath);
        const currentParagraph = Editor.node(editor, currentNodePath);
        // Check if currentNode is an equation
        if (currentNode.type === "equation") {
          event.preventDefault();
        } else {
          // Check if the previous node is an equation
          const prevNodeEntry = Editor.previous(editor, {
            at: currentNodePath,
          });

          if (prevNodeEntry) {
            const [_prevNode] = prevNodeEntry;

            if (
              _prevNode.type === "equation" &&
              Editor.isStart(editor, selection.anchor, _currentNodePath)
            ) {
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
          }
        }
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

      const equationElement = findAncestorWithClass(
        event.target,
        "equation-element"
      );

      if (equationElement) {
        // Get the path from the data-path attribute
        const pathString = equationElement.getAttribute("data-path");
        if (pathString) {
          console.log(pathString);
          const path: Path = JSON.parse(pathString);
          openEditBlockPopup(equationElement, event, path);
        }
      }
    }
  }

  const handleEditLatex = (value: string, path: Path) => {
    const latex = value;
    const equationNode = {
      type: "equation",
      latex,
      children: [{ text: "" }],
    };

    Transforms.setNodes(editor, equationNode, { at: path });
    console.log(path);
    const currentElement = document.querySelector(
      `[data-path="${JSON.stringify(path)}"]`
    );
    console.log(currentElement);
    if (currentElement) {
      setTimeout(() => {
        const targetRect = currentElement.getBoundingClientRect();
        const height = currentElement.offsetHeight;
        console.log(height);

        setDropdownEditBlockTop(targetRect.bottom + 60);
      }, 0);
    }
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
    setactiveEditEquationPath((prevPath) =>
      prevPath === currentPathString ? null : currentPathString
    );

    const [currentNode] = Editor.node(editor, path);

    setCurrentLatex(currentNode.latex);

    setShowEditBlockPopup(true);
    const equationHeight = _element.offsetHeight;
    setDropdownEditBlockTop(targetRect.bottom + 60);
    setDropdownEditBlockLeft(targetRect.left);
  };

  const toggleRef = useRef<HTMLButtonElement>(null);
  const toggleEditBlockRef = useRef<HTMLElement>(null);

  const [_equationId, setEquationId] = useState("");
  const [addButtonHoveredId, setAddButtonHoveredId] = useState(null);

  const handleAddEditableEquationBlock = useCallback(
    (latex: string, path: Path) => {
      if (showDropdown) {
        const equationId = genNodeId();

        const equationNode: CustomElement = {
          id: equationId,
          type: "equation",
          latex,
          children: [{ text: "" }],
        };

        const [currentNode] = Editor.node(editor, path);
        const isEmptyNode =
          (currentNode.type === "paragraph" &&
            currentNode.children[0].text === "") ||
          currentNode.children[0].text === " ";

        let newPath: Path;

        if (isEmptyNode) {
          Transforms.setNodes(editor, equationNode, { at: path });
          newPath = path;
          Transforms.insertNodes(
            editor,
            { id: genNodeId(), type: "paragraph", children: [{ text: "" }] },
            { at: Path.next(path) }
          );
        } else {
          Transforms.insertNodes(editor, equationNode, { at: Path.next(path) });
          newPath = Path.next(path);
        }

        const [insertedEquationNode] = Editor.nodes(editor, {
          at: newPath,
          match: (n) => n.type === "equation",
        });

        if (insertedEquationNode) {
          const { id } = insertedEquationNode[0] as CustomElement;
          setEquationId(id);
          setactiveEditEquationPath(JSON.stringify(newPath));
          setCurrentLatex("");
          setTimeout(() => {
            const currentElement = document.querySelector(`[data-id="${id}"]`);
            console.log(currentElement);
            if (currentElement) {
              const targetRect = currentElement.getBoundingClientRect();
              setDropdownEditBlockLeft(targetRect.left);
              setDropdownEditBlockTop(targetRect.bottom + 60);
              console.log(targetRect.left);
            }
          }, 0);
        }
      }
    },
    [showDropdown, toggleEditBlockRef]
  );

  const findEquationElementById = (id: string) => {
    return document.querySelector(`[data-id="${id}"]`);
  };

  useEffect(() => {
    if (_equationId && slatevalue) {
      const equationElement = findEquationElementById(_equationId);

      if (equationElement) {
        // Get the position of the newly added equation element
        const targetRect = equationElement.getBoundingClientRect();
        console.log(equationElement);
        // Open the edit block dropdown and set its position
        setShowEditBlockPopup(true);
        setDropdownEditBlockTop(targetRect.bottom + 60);
      }
    }
  }, [slatevalue, _equationId]);

  const renderElement = useCallback(
    (props) => {
      const { attributes, children, element } = props;

      const elementPath = ReactEditor.findPath(editor, element);
      const isRoot = elementPath.length === 1;

      const [parentElement, parentPath] = Editor.parent(editor, elementPath);
      const isInsideColumnCell = parentElement.type === "column-cell";
      const addButton =
        (isRoot && element.type !== "column") || isInsideColumnCell ? (
          <div className="z-100 absolute top-1/2 left-0 -mt-5 flex h-10 w-10  cursor-pointer items-center justify-center">
            <button
              className={`rounded-md hover:bg-gray-200 ${
                addButtonHoveredId === element.id ? "opacity-100" : "opacity-0"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                openMiniDropdown(event, ReactEditor.findPath(editor, element));
              }}
              ref={toggleRef}
            >
              <Plus color={theme.colors.darkgray} />
            </button>
          </div>
        ) : null;

      const content =
        (isRoot && element.type !== "column") || isInsideColumnCell ? (
          <SortableElement
            {...props}
            renderElement={(props) => <ElementSelector {...props} />}
          />
        ) : (
          <ElementSelector {...props} />
        );

      return (
        <div
          className="group relative"
          onMouseEnter={() => setAddButtonHoveredId(element.id)}
          onMouseLeave={() => setAddButtonHoveredId(null)}
          onKeyDown={() => setAddButtonHoveredId(null)}
        >
          {content}
          {addButton}
        </div>
      );
    },
    [addButtonHoveredId]
  );

  const findPathById = (editor, id) => {
    let foundPath = null;

    for (const [node, path] of Node.nodes(editor, { at: [] })) {
      if (node.id === id) {
        foundPath = path;
        break;
      }
    }

    return foundPath;
  };

  const [insertDirection, setInsertDirection] = useState(null);

  const createColumns = (fromPath, over) => {
    // Remove the dragged node
    const [draggedNode] = Editor.node(editor, fromPath);
    const overPath = over.path;

    const [droppedNode] = Editor.node(editor, overPath);

    // Create a new column with the dragged node and the target node
    const newColumn = {
      type: "column",
      children: [
        { type: "column-cell", children: [draggedNode] },
        { type: "column-cell", children: [droppedNode] },
      ],
    };

    // Find the target node's path
    const toPath = findPathById(editor, over.id);

    // Insert the new column before or after the target node
    Transforms.insertNodes(editor, newColumn, {
      at: insertDirection === "left" ? toPath : Path.next(toPath),
      select: true,
    });

    Transforms.removeNodes(editor, { at: overPath });

    Transforms.removeNodes(editor, { at: fromPath });
  };

  const handleDragEnd = useCallback(
    function (event) {
      const { active, over } = event;
      if (!over) {
        return;
      }

      // Find the nodes using their IDs
      const fromPath = findPathById(editor, active.id);
      const toPath = findPathById(editor, over.id);

      const [fromParentElement, fromParentPath] = Editor.parent(
        editor,
        fromPath
      );
      const [toParentElement, toParentPath] = Editor.parent(editor, toPath);

      // Check if the dragged element should be inserted before or after the target element
      const toIndexOffset =
        fromParentPath.join() === toParentPath.join() &&
        fromParentPath[fromParentPath.length - 1] <
          toParentPath[toParentPath.length - 1]
          ? 1
          : 0;

      const isRootLevel = fromPath.length === 1 && toPath.length === 1;

      console.log(fromPath, toPath);
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

        createColumns(fromPath, { id: over.id, path: targetPath });
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

      setCreatingNewColumn(false);
      setActiveId(null);
    },
    [editor, creatingNewColumn]
  );

  function Droppable({ children }) {
    const droppable = useDroppable({
      id: "droppable-area",
    });

    const findPathById = (editor, id) => {
      try {
        const [nodeEntry] = Editor.nodes(editor, {
          match: (n) => n.id === id,
          at: [],
        });
        if (nodeEntry) {
          return ReactEditor.findPath(editor, nodeEntry[0]);
        }
      } catch (err) {
        // Log the error if necessary
      }
      return null;
    };

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

        console.log("activePath:", activePath);
        console.log("overPath:", overPath);

        if (activePath && overPath) {
          const isNearRoot = activePath.length === 1 && overPath.length === 1;
          console.log("isNearRoot:", isNearRoot);
          setCreatingNewColumn(isNearRoot);

          if (isNearRoot) {
            const insertToLeft = activePath[0] < overPath[0];
            setInsertDirection(insertToLeft ? "left" : "right");
          } else {
            setInsertDirection(null);
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
    setActiveId(active.id);
  }, []);

  function findElementById(node, id) {
    if (node.id === id) {
      return node;
    }

    if (node.children) {
      for (const child of node.children) {
        const found = findElementById(child, id);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  function findElementInSlateValue(slateValue, id) {
    for (const node of slateValue) {
      const found = findElementById(node, id);
      if (found) {
        return found;
      }
    }

    return null;
  }

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
      className="relative mx-auto mt-3 block h-[550px] rounded-md pt-4 pr-4 pb-4 pl-2 focus:outline-none focus-visible:border-gray-300"
    >
      <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <SortableContext
          items={slatevalue}
          strategy={verticalListSortingStrategy}
        >
          <ActiveElementProvider activeIndex={activeIndex}>
            <EquationProvider editor={editor}>
              <Slate
                editor={editor}
                value={slatevalue}
                key={editorKey}
                onChange={(newValue) => {
                  setValue(newValue);

                  if (handleTextChange) {
                    handleTextChange(newValue);
                  }
                }}
              >
                <Droppable>
                  <Editable
                    className="relative h-[520px]"
                    placeholder="Press '/' for prompts"
                    renderElement={renderElement}
                    onKeyDown={handleKeyDown}
                    onClick={(event) => handleCursorClick(event, editor)}
                  />
                </Droppable>
              </Slate>
            </EquationProvider>
          </ActiveElementProvider>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <DragOverlayContent
              element={findElementInSlateValue(slatevalue, activeId)}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <AnimatePresence>
        {showDropdown && activePath && (
          <motion.div
            {...y_animation_props}
            className="fixed left-[120px] z-10 mx-auto mt-2 w-[320px]"
            style={{
              top: `${dropdownTop}px`,
              left: `${dropdownLeft}px`,
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
              className="fixed  z-10 z-10 mx-auto mt-2 mt-2 w-[380px]"
              style={{
                top: `${dropdownEditBlockTop}px`,
                left: `${dropdownEditBlockLeft}px`,
              }}
            >
              <EditBlockPopup
                ref={editBlockDropdownRef}
                onChange={(value) =>
                  handleEditLatex(value, JSON.parse(activeEditEquationPath))
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
                    { at: Path.next(JSON.parse(activeEditEquationPath)) }
                  );
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
  );
};

export default DocumentEditor;
