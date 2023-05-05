// SlideBreak.js
import { EditorContext } from "@/contexts/EditorContext";
import React, { useContext, useState } from "react";
import { ReactEditor } from "slate-react";
import { ChevronDown, ChevronUp } from "lucide-react";

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

    const slideNumberTop = slideBreakIndex + 1;
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
        <div className="mt-3 mb-3 block w-[95%] w-full text-center">
          <div className="mb-2 flex justify-end text-gray-500">
            {" "}
            <div className="relative mr-1 flex flex-col items-center text-sm">
              {/* <ChevronUp className="absolute -top-5 w-4 text-gray-500" /> */}
              <div className="w-10 text-center text-3xl text-gray-400">
                {slideNumbers.slideNumberTop}
              </div>
            </div>
          </div>
          <div className="mr-2 block h-[5px] -translate-y-1 border-b-4 border-dashed border-gray-400"></div>
          <div className="mt-1  flex justify-end text-gray-500">
            <div className="relative mr-1 flex flex-col items-center text-sm">
              {/* <ChevronDown className="absolute -top-5 w-4 text-gray-500" /> */}
              <div className="w-10 text-center text-3xl text-gray-400">
                {slideNumbers.slideNumberBottom}
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }
);
