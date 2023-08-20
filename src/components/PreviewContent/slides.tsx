import { EditorContext } from "@/contexts/EditorContext";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { parseNodes, splitIntoSlides } from "@/utils/renderHelpers";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { SlideBreak } from "@/icons/SlideBreak";
import { useLocalStorage } from "usehooks-ts";
import { useRouter } from "next/router";

export const SlidesPreview = () => {
  const router = useRouter();

  const workspaceId = router.query.workspaceId;

  const { editor: fromEditor, activePath } = useContext(EditorContext);
  const [localValue, setLocalValue] = useState(fromEditor.children);
  const [currentSlideIndex, setCurrentSlideIndex] = useLocalStorage(
    `currentSlideIndex-${workspaceId}`,
    0
  );

  const slidesRef = useRef(null);
  const { workspaceData, setScrollToSlide, scrolltoSlide } = useTextSpeech();

  const fontFam = workspaceData.workspace.font_style;

  useEffect(() => {
    setLocalValue(fromEditor.children);
  }, [fromEditor.children]);

  const slides = splitIntoSlides(localValue);

  const handleNext = () => {
    setCurrentSlideIndex((prevIndex) =>
      Math.min(prevIndex + 1, slides.length - 1)
    );
  };

  const handlePrevious = () => {
    setCurrentSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSlideIndex, slides]);

  useEffect(() => {
    setScrollToSlide(currentSlideIndex + 1);

    console.log(currentSlideIndex);
  }, [currentSlideIndex]);

  if (slides.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className=" flex flex-col  items-center gap-4  p-7  dark:bg-muted">
          <div className=" flex h-[44px] w-[44px] items-center justify-center rounded-md border border-gray-300 bg-white p-1 dark:opacity-80">
            <SlideBreak />
          </div>
          <p className="w-[200px] text-center text-lg">
            Add Slide Breaks to get started
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className=" sticky top-0  z-10 flex gap-3 border-b border-accent bg-white p-5  text-gray-700 shadow-sm dark:bg-muted dark:text-gray-200">
        <span className=" flex min-w-[50px]">
          <span className="flex w-[20px] justify-center ">
            {currentSlideIndex + 1}
          </span>{" "}
          / {slides.length}
        </span>

        <span className={`font-bold ${fontFam}`}>
          {fromEditor.children[0].children[0].text}
        </span>
      </div>
      <div
        ref={slidesRef}
        tabIndex={-1}
        className={`relative p-5 pb-20  outline-none dark:border-accent dark:bg-muted`}
      >
        {parseNodes(slides[currentSlideIndex], fontFam, true)}
        <div className="fixed bottom-8 right-8  h-[40px] shadow-md">
          <Button
            className="h-[40px] w-[40px]  rounded-none border border-r-0 border-gray-700 p-0 dark:border-gray-200"
            onClick={handlePrevious}
            disabled={currentSlideIndex === 0}
          >
            <ArrowLeft className="h-8 w-8 stroke-accent" />
          </Button>
          <Button
            className={cn(
              `h-[40px] w-[40px] rounded-none border border-gray-700 p-0  disabled:border-l-0  ${
                currentSlideIndex === 0 && "border-l-0"
              } dark:border-gray-200`
            )}
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
          >
            <ArrowRight className="h-8 w-8 stroke-accent" />
          </Button>
        </div>
      </div>
    </>
  );
};
