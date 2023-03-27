// import { React, useSortable, CSS, classNames } from "../deps";
import { useActiveElement } from "@/contexts/ActiveElementContext";

import { useReadOnly } from "slate-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classes from "./styles/SortableElement.module.css";
import { default as classNames } from "classnames";
import { GripVertical } from "lucide-react";
import { useTheme } from "styled-components";

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
