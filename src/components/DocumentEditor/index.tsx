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
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  DefaultElement,
} from "slate-react";
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
import { createPortal } from "react-dom";

import { makeNodeId, withNodeId } from "@/utils/nodeId";

import {
  SortableContext,
  useSortable,
  AnimateLayoutChanges,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface DocumentEditorProps {
  handleTextChange?: (value: any) => void;
}

type CustomElement = {
  id: string;
  type: "paragraph" | "equation";
  children: CustomText[];
  isEditable: boolean;
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

const useEditor = () =>
  useMemo(() => withNodeId(withReact(createEditor())), []);

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

export default function App() {
  const editor = useEditor();

  const [value, setValue] = useState([
    {
      id: makeNodeId(),
      children: [
        {
          text: "Interval (music)",
        },
      ],
    },
    {
      id: makeNodeId(),
      children: [
        {
          text: "In music theory, an interval is a difference in pitch between two sounds. An interval may be described as horizontal, linear, or melodic if it refers to successively sounding tones, such as two adjacent pitches in a melody, and vertical or harmonic if it pertains to simultaneously sounding tones, such as in a chord.",
        },
      ],
    },
  ]);
  const [activeId, setActiveId] = useState(null);
  const activeElement = editor.children.find((x) => x.id === activeId);

  const handleDragStart = (event) => {
    if (event.active) {
      clearSelection();
      setActiveId(event.active.id);
    }
  };

  const handleDragEnd = (event) => {
    const overId = event.over?.id;
    const overIndex = editor.children.findIndex((x) => x.id === overId);

    if (overId !== activeId && overIndex !== -1) {
      Transforms.moveNodes(editor, {
        at: [],
        match: (node) => node.id === activeId,
        to: [overIndex],
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const clearSelection = () => {
    ReactEditor.blur(editor);
    Transforms.deselect(editor);
    window.getSelection()?.empty();
  };

  const renderElement = useCallback((props) => {
    const isTopLevel = ReactEditor.findPath(editor, props.element).length === 1;

    return isTopLevel ? (
      <SortableElement {...props} renderElement={renderElementContent} />
    ) : (
      renderElementContent(props)
    );
  }, []);

  const items = useMemo(
    () => editor.children.map((element) => element.id),
    [editor.children]
  );

  return (
    <Slate editor={editor} value={value} onChange={setValue}>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <Editable renderElement={renderElement} />
        </SortableContext>
        {createPortal(
          <DragOverlay adjustScale={false}>
            {activeElement && <DragOverlayContent element={activeElement} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </Slate>
  );
}

const renderElementContent = (props) => <DefaultElement {...props} />;

const SortableElement = ({ attributes, element, children, renderElement }) => {
  const sortable = useSortable({ id: element.id });

  return (
    <div {...attributes}>
      <Sortable sortable={sortable}>
        <button contentEditable={false} {...sortable.listeners}>
          ⠿
        </button>
        <div>{renderElement({ element, children })}</div>
      </Sortable>
    </div>
  );
};

const Sortable = ({ sortable, children }) => {
  return (
    <div
      className="sortable"
      {...sortable.attributes}
      ref={sortable.setNodeRef}
      style={{
        transition: sortable.transition,
        "--translate-y": toPx(sortable.transform?.y),
        pointerEvents: sortable.isSorting ? "none" : undefined,
        opacity: sortable.isDragging ? 0 : 1,
      }}
    >
      {children}
    </div>
  );
};

const DragOverlayContent = ({ element }) => {
  const editor = useEditor();
  const [value] = useState([JSON.parse(JSON.stringify(element))]); // clone

  return (
    <div className="drag-overlay">
      <button>⠿</button>
      <Slate editor={editor} value={value}>
        <Editable readOnly={true} renderElement={renderElementContent} />
      </Slate>
    </div>
  );
};
