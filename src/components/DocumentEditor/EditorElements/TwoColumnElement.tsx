import React from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { SortableElement } from "../SortableElement";
import { RenderElementProps } from "slate-react";

interface TwoColumnElementProps extends RenderElementProps {
  handleDragEnd: (event: any) => void;
  handleDragStart: (event: any) => void;
  DragOverlayContent: React.FC<{ element: any }>;
}

export function TwoColumnElement({
  children,
  handleDragEnd,
  handleDragStart,
  DragOverlayContent,
}: TwoColumnElementProps) {
  const [leftColumn, rightColumn] = React.Children.toArray(children);

  const columnElements = [
    ...(leftColumn ? [(leftColumn as RenderElementProps).element] : []),
    ...(rightColumn ? [(rightColumn as RenderElementProps).element] : []),
  ];

  return (
    <div className="flex">
      <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <SortableContext
          items={columnElements}
          strategy={verticalListSortingStrategy}
        >
          <div className="w-1/2">
            {leftColumn && (
              <SortableElement
                {...(leftColumn as RenderElementProps)}
                renderElement={(props) => <ElementSelector {...props} />}
              />
            )}
          </div>
          <div className="w-1/2">
            {rightColumn && (
              <SortableElement
                {...(rightColumn as RenderElementProps)}
                renderElement={(props) => <ElementSelector {...props} />}
              />
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
