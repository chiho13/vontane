// import { React, useSortable, CSS, classNames } from "../deps";
import { useActiveElement } from "@/contexts/ActiveElementContext";

import { ReactEditor, useReadOnly } from "slate-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classes from "./styles/SortableElement.module.css";
import { default as classNames } from "classnames";
import { GripVertical } from "lucide-react";
import { useTheme } from "styled-components";
import { EquationContext } from "@/contexts/EquationEditContext";
import { useContext, useMemo } from "react";
import { Editor } from "slate";
export function SortableElement({
  attributes,
  children,
  element,
  renderElement,
}) {
  const { activeIndex } = useActiveElement();
  const readOnly = useReadOnly();

  const theme = useTheme();
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

  const { editor } = useContext(EquationContext);

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
      >
        {readOnly ? null : (
          <div className="flex w-[60px] justify-end">
            <button
              ref={setActivatorNodeRef}
              {...listeners}
              className={classes.handle}
              contentEditable={false}
            >
              <GripVertical color={theme.colors.darkgray} width={20} />
            </button>
          </div>
        )}
        <div
          className={classNames(
            classes.elementWrapper,
            over?.id === element.id
              ? index > activeIndex
                ? classes.insertAfter
                : classes.insertBefore
              : undefined
          )}
        >
          {renderElement({ attributes, children, element })}
        </div>
      </div>
    </div>
  );
}
