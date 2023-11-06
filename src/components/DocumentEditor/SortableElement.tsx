// import { React, useSortable, CSS, classNames } from "../deps";
import { useActiveElement } from "@/contexts/ActiveElementContext";

import { ReactEditor, useReadOnly } from "slate-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classes from "./styles/SortableElement.module.css";
import { default as classNames } from "classnames";
import { Grip, GripHorizontal, GripVertical, Plus } from "lucide-react";
import { useTheme } from "styled-components";
import { EditorContext, SlateEditorContext } from "@/contexts/EditorContext";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Editor, Range } from "slate";
import { useNewColumn } from "@/contexts/NewColumnContext";
import { useLocalStorage } from "usehooks-ts";
import { debounce } from "lodash";
import { findPathById } from "./helpers/createColumns";

export function SortableElement({
  attributes,
  children,
  element,
  renderElement,
  addButton,
  optionMenu,
}) {
  const { activeIndex } = useActiveElement();
  const readOnly = useReadOnly();

  const theme = useTheme();

  const { creatingNewColumn, insertDirection } = useNewColumn();

  const {
    attributes: sortableAttributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    over,
    index,
    isSorting,
    isDragging,
  } = useSortable({ id: element.id });

  const slideBreakListener = element.type === "slide" && listeners;

  const { editor } = useContext(SlateEditorContext);

  const eleventtsListener = element.type === "tts" && listeners;
  const [isHovered, setIsHovered] = useState(false);
  const handleKeyDown = useRef<() => void>();
  const handleKeyUp = useRef<() => void>();
  let timeoutId: NodeJS.Timeout | null = null;

  const [isTyping, setIsTyping] = useState(false);

  const setIsTypingFalse = debounce(() => setIsTyping(false), 1000);

  console.log(index);

  const [prevIndex, setPrevIndex] = useState(index);

  const initialIndex = useRef(0);
  useEffect(() => {
    setPrevIndex(index);
  }, [index]);

  const isDraggingDown = index > prevIndex;
  const isDraggingUp = index < prevIndex;

  useEffect(() => {
    const onKeyDown = (event) => {
      // Check if the key pressed is not an arrow key
      if (element.type === "datavis") return;
      if (![37, 38, 39, 40].includes(event.keyCode)) {
        setIsTyping(true);
        setIsTypingFalse();
      }
    };

    const el = ReactEditor.toDOMNode(editor, editor);
    el.addEventListener("keydown", onKeyDown);

    return () => {
      el.removeEventListener("keydown", onKeyDown);
      setIsTypingFalse.cancel(); // Cancel the debounce on unmount
    };
  }, [editor]);

  return (
    <div>
      <div
        className={classNames(
          classes.sortableElement,
          isDragging && classes.active,
          "group",
          (element.type === "heading-one" ||
            element.type === "heading-two" ||
            element.type === "heading-three") &&
            "items-center",
          element.type !== "tts" && "mb-3 mt-3"
        )}
        ref={setNodeRef}
        {...sortableAttributes}
        style={{
          transition,
          transform: isSorting ? undefined : CSS.Transform.toString(transform),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isTyping ? (
          <div
            className={`group flex h-[24px] w-[48px] justify-end ${
              element.type === "tts" && " absolute -left-4 top-2"
            }`}
            style={{
              zIndex: 1000,
            }}
          ></div>
        ) : (
          <div
            className={`group flex h-[24px] w-[48px] justify-end ${
              element.type === "tts" && " absolute -left-4 top-2"
            }`}
            style={{
              zIndex: 1000,
            }}
          >
            <div
              className={classNames(
                classes.addButton,
                " opacity-0  group-hover:opacity-100"
              )}
            >
              {addButton}
            </div>
            <button
              ref={setActivatorNodeRef}
              {...listeners}
              className={` ${
                element.type === "tts" && "h-[18px] p-px"
              } flex cursor-grab items-center  rounded-md opacity-0  hover:bg-gray-300 group-hover:opacity-100 dark:hover:bg-accent`}
              contentEditable={false}
            >
              {element.type === "tts" ? (
                <GripHorizontal
                  className={`stroke-muted-foreground  dark:stroke-muted-foreground `}
                  width={22}
                />
              ) : (
                <GripVertical
                  className={`stroke-muted-foreground dark:stroke-muted-foreground `}
                  width={18}
                />
              )}
            </button>
          </div>
        )}
        <div
          className={classNames(
            classes.elementWrapper,
            over?.id === element.id && !creatingNewColumn
              ? insertDirection === "down" && classes.insertAfter
              : undefined,
            over?.id === element.id && !creatingNewColumn
              ? insertDirection === "up" && classes.insertBefore
              : undefined,
            over?.id === element.id &&
              creatingNewColumn &&
              insertDirection === "right"
              ? classes.createNewColumnRight
              : undefined,
            over?.id === element.id &&
              creatingNewColumn &&
              insertDirection === "left"
              ? classes.createNewColumnLeft
              : undefined
          )}
        >
          <div {...slideBreakListener}>
            {renderElement({ attributes, children, element })}
          </div>
        </div>

        {element.type !== "datavis" &&
          element.type !== "embed" &&
          element.type !== "image" &&
          element.type !== "tts" &&
          element.type !== "map" && (
            <div className="ml-2 opacity-0 group-hover:opacity-100">
              {optionMenu}
            </div>
          )}
      </div>
    </div>
  );
}
