// SlideBreak.js
import { EditorContext } from "@/contexts/EditorContext";
import React, { useContext, useState } from "react";
import { ReactEditor } from "slate-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "styled-components";

const findSlideBreakElements = (nodes: any[]) => {
  let slideBreakElements: any[] = [];
  nodes.forEach((node: { type: string; children: any }) => {
    if (node.type === "slide") {
      slideBreakElements.push(node);
    } else if (node.children && Array.isArray(node.children)) {
      slideBreakElements.push(...findSlideBreakElements(node.children));
    }
  });
  return slideBreakElements;
};

const withSlideNumbering = (Component) => {
  return (props) => {
    const { element } = props;
    const { editor } = useContext(EditorContext);

    if (!editor) {
      return <Component {...props} slideNumbers={null} />;
    }

    const slideBreakElements = findSlideBreakElements(editor.children);
    const slideBreakIndex = slideBreakElements.findIndex(
      (slide) => slide.id === element.id
    );
    const isAdjacent = slideBreakIndex < slideBreakElements.length - 1;
    const isLastSlide = slideBreakIndex === slideBreakElements.length - 1;

    const slideNumberTop = slideBreakIndex + 2;
    const slideNumberBottom = slideBreakIndex + 2;

    return (
      <Component
        {...props}
        slideNumbers={
          isAdjacent
            ? { slideNumberTop, slideNumberBottom: null }
            : isLastSlide
            ? { slideNumberTop, slideNumberBottom }
            : { slideNumberTop, slideNumberBottom: null }
        }
      />
    );
  };
};

export const SlideBreak = withSlideNumbering(
  ({ attributes, children, element, slideNumbers }) => {
    const { editor } = useContext(EditorContext);
    const path = ReactEditor.findPath(editor, element);

    const theme = useTheme();

    return (
      <div
        {...attributes}
        {...attributes}
        data-id={element.id}
        data-path={JSON.stringify(path)}
        className="relative flex cursor-grab items-center"
        contentEditable={false}
      >
        {/* <hr className="border-1 my-4 h-1 w-[98%] divide-dashed rounded bg-gray-400" />
         */}
        <div className="mt-1 mb-1 flex w-[100%] items-center text-center">
          <div className="mr-2 block h-[5px] grow -translate-y-1 border-b-2 border-gray-300 dark:border-slate-400"></div>
          <div className=" flex justify-end text-gray-500">
            {" "}
            <div className="relative -top-[2px] mr-1 flex flex-col items-center text-sm">
              {/* <ChevronUp className="absolute -top-5 w-4 text-gray-500" /> */}
              <div
                className={`w-10 text-center text-base font-semibold text-brand dark:text-foreground`}
              >
                {slideNumbers.slideNumberTop}
              </div>
            </div>
          </div>
          <div className="mr-2 block h-[5px] grow -translate-y-1 border-b-2 border-gray-300 dark:border-slate-400"></div>
        </div>
        {children}
      </div>
    );
  }
);
