// import { React, useSortable, CSS, classNames } from "../deps";
import { useActiveElement } from "@/contexts/ActiveElementContext";

import { useReadOnly } from "slate-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classes from "./styles/SortableElement.module.css";
import { default as classNames } from "classnames";

export function SortableElement({
  attributes,
  children,
  element,
  renderElement,
}) {
  const { activeIndex } = useActiveElement();
  const readOnly = useReadOnly();
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
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            className={classes.handle}
            contentEditable={false}
          >
            ⠿
          </button>
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
