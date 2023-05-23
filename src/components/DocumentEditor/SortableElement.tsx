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

  const { creatingNewColumn } = useNewColumn();

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
      >
        {readOnly ? null : (
          <div className="flex h-[24px] w-[46px] justify-end">
            <div className={classNames(classes.addButton)}>{addButton}</div>
            <button
              ref={setActivatorNodeRef}
              {...listeners}
              className={`${classes.handle} flex items-center hover:bg-gray-200 dark:hover:bg-accent`}
              contentEditable={false}
            >
              <GripVertical
                className="stroke-darkgray dark:stroke-muted-foreground"
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
              classes.createNewColumnRight
          )}
        >
          <div {...slideBreakListener}>
            {renderElement({ attributes, children, element })}
          </div>
        </div>
        {element.type !== "image" && optionMenu}
      </div>
    </div>
  );
}
