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
          isDragging && classes.active
        )}
        ref={setNodeRef}
        {...sortableAttributes}
        style={{
          transition,
          transform: isSorting ? undefined : CSS.Transform.toString(transform),
        }}
        {...slideBreakListener}
      >
        {readOnly ? null : (
          <div className="flex w-[58px] translate-x-[2px] justify-end">
            <div className={classNames(classes.addButton)}>{addButton}</div>
            <button
              ref={setActivatorNodeRef}
              {...listeners}
              className={`${classes.handle} hover:bg-gray-200 dark:hover:bg-accent`}
              contentEditable={false}
            >
              <GripVertical className="stroke-darkgray" width={20} />
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
          {renderElement({ attributes, children, element })}
        </div>
      </div>
    </div>
  );
}
