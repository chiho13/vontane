// import { React, useSortable, CSS, classNames } from "../deps";
import { useActiveElement } from "@/contexts/ActiveElementContext";

import { ReactEditor, useReadOnly } from "slate-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classes from "./styles/SortableElement.module.css";
import { default as classNames } from "classnames";
import { GripVertical, Plus } from "lucide-react";
import { useTheme } from "styled-components";
import { EditorContext } from "@/contexts/EditorContext";
import React, { useContext, useMemo, useState } from "react";
import { Editor } from "slate";
import { useNewColumn } from "@/contexts/NewColumnContext";

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

  console.log(creatingNewColumn);
  console.log("insertDirection", insertDirection);
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
  const [isHovered, setIsHovered] = useState(false);

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
            "items-center"
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
        {readOnly ? null : (
          <div className="group flex h-[24px] w-[46px] justify-end ">
            <div
              className={classNames(
                classes.addButton,
                " opacity-0 group-hover:opacity-100"
              )}
            >
              {addButton}
            </div>
            <button
              ref={setActivatorNodeRef}
              {...listeners}
              className={`${classes.handle} opactiy-0 flex items-center hover:bg-gray-300 group-hover:opacity-100 dark:hover:bg-accent `}
              contentEditable={false}
            >
              <GripVertical
                className="stroke-muted-foreground dark:stroke-muted-foreground"
                width={22}
              />
            </button>
          </div>
        )}
        <div
          className={classNames(
            classes.elementWrapper,
            over?.id === element.id && !creatingNewColumn
              ? index > activeIndex
                ? classes.insertAfter
                : classes.insertBefore
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

        {element.type !== "image" &&
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
