import { EditorContext, EditorProvider } from "@/contexts/EditorContext";
import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import { Path, Text, Node } from "slate";
import Link from "next/link";

import { useRouter } from "next/router";
import { ModeToggle } from "@/components/mode-toggle";
import { AudioManagerProvider } from "@/contexts/PreviewAudioContext";
import { Button } from "@/components/ui/button";
import { parseNodes, splitIntoSlides } from "@/utils/renderHelpers";

import { SlideBreak } from "@/icons/SlideBreak";
import { useLocalStorage } from "usehooks-ts";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { ViewToggle } from "@/components/view-toggle";
import { ThemeProvider } from "styled-components";
import classNames from "classnames";

export const WidgetRenderer = ({
  workspaceData,
  font,
  brandColor,
  isWidget = false,
  widgetWidth = "",
}) => {
  const router = useRouter();
  const view = router.query.view || "one-page";

  const [localValue, setLocalValue] = useState(null);

  const [currentTheme, setCurrentTheme] = useState({
    brandColor: "#0E78EF", // initial default value
    accentColor: "#e9e9e9",
  });
  console.log(workspaceData);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (workspaceData) {
      const parsedSlateValue = JSON.parse(workspaceData);
      setLocalValue(parsedSlateValue);
    }

    return () => {
      setLocalValue(null);
    };
  }, [workspaceData]);

  useEffect(() => {
    if (brandColor) {
      setCurrentTheme({
        brandColor,
        accentColor: "#e9e9e9",
      });
    }
  }, [brandColor]);

  const isMCQPresent = (children: any[]) => {
    if (Array.isArray(children)) {
      for (let child of children) {
        if (child.node && child.node.type === "mcq") {
          return true;
        }

        // If the child has its own children, check them too
        if (Array.isArray(child.children)) {
          if (isMCQPresent(child.children)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const slides = localValue && splitIntoSlides(localValue);

  const slideWidth = 100;
  const totalSlidesWidth = slides && slides.length * slideWidth;
  const slideTranslateValue = -(currentSlideIndex * slideWidth);
  const slideContainerStyle = {
    display: "flex",
    flexBasis: `${totalSlidesWidth}%`,
    transform: `translateX(${slideTranslateValue}%)`,
    transition: "transform 300ms ease-in-out",
    height: "calc(100svh - 65px)",
  };

  const individualSlideStyle = {
    width: "100%",
    flexShrink: 0,
  };

  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const handleTouchStart = (e) => {
    e.preventDefault();
    setTouchStartX(e.touches[0].clientX);
    console.log("Touch started at:", e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (touchStartX - touchEndX > 100) {
      // swiped left
      handleNext();
    } else if (touchEndX - touchStartX > 100) {
      // swiped right
      handlePrevious();
    }

    // Resetting after handling the swipe
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    setTouchEndX(e.touches[0].clientX);
  };

  const slidesContainer = useRef(null) as any;

  const slideRef = useRef(null);

  const handleNext = () => {
    setCurrentSlideIndex((prevIndex) =>
      Math.min(prevIndex + 1, slides.length - 1)
    );
    slidesContainer.current.scrollTo(0, 0);
  };

  const handlePrevious = () => {
    setCurrentSlideIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    slidesContainer.current.scrollTo(0, 0);
  };

  useEffect(() => {
    if (view !== "slides") return;
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
    const slidesElement = slideRef.current;

    if (!slidesElement) return;

    slidesElement.addEventListener("touchstart", handleTouchStart);
    slidesElement.addEventListener("touchmove", handleTouchMove);
    slidesElement.addEventListener("touchend", handleTouchEnd);

    return () => {
      slidesElement.removeEventListener("touchstart", handleTouchStart);
      slidesElement.removeEventListener("touchmove", handleTouchMove);
      slidesElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [touchStartX, touchEndX]);

  if (slides && slides.length === 0 && view === "slides") {
    return (
      <div className="flex h-[100svh] w-full items-center justify-center">
        <div className=" flex flex-col  items-center gap-4  p-7  ">
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

  if (!workspaceData) {
    // Show 404 page if workspaceId is not found
    return (
      <div className="flex h-[100svh] w-full flex-col items-center justify-center">
        <div className="text-bold mb-2 text-8xl">404</div>
        <p className="text-2xl">Workspace not found</p>

        <Link href="/">
          <Button className="mt-4 ">Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    localValue && (
      <ThemeProvider theme={currentTheme}>
        <AudioManagerProvider>
          <div className="published">
            {view === "slides" ? (
              <div
                className=" sticky top-0  flex gap-3 border-b border-gray-300 p-5  text-gray-700 shadow-md  dark:border-gray-700  dark:bg-[#191919] dark:text-gray-200"
                style={{
                  zIndex: 1000,
                }}
              >
                <span className=" flex min-w-[50px]">
                  <span className="flex w-[20px] justify-center ">
                    {currentSlideIndex + 1}
                  </span>{" "}
                  / {slides && slides.length}
                </span>
                <span className={`font-bold ${font}`}>
                  {localValue[0].children[0].text}
                </span>
              </div>
            ) : null}
            {view === "one-page" ? (
              <div
                className={`relative  overflow-y-auto bg-white  dark:bg-[#191919] `}
              >
                <div
                  className={cn(
                    `relative mx-auto mb-4 max-w-[580px]`,
                    widgetWidth
                  )}
                >
                  {parseNodes(localValue, font)}
                </div>
              </div>
            ) : (
              <div
                ref={slidesContainer}
                className={`relative  overflow-y-auto  overflow-x-hidden bg-white p-6 pb-[100px] dark:bg-[#191919] `}
                // style={{
                //   height: "calc(100svh - 65px)",
                // }}
              >
                <div
                  ref={slideRef}
                  className="relative mx-auto max-w-[700px] xl:mt-[40px]"
                  style={slideContainerStyle}
                >
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={` w-[300px] transition-opacity duration-300 lg:w-full ${
                        currentSlideIndex === index
                          ? " opacity-100 "
                          : "pointer-events-none  opacity-0"
                      }`}
                      style={individualSlideStyle}
                    >
                      {currentSlideIndex === index &&
                        parseNodes(slide, font, true)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="fixed right-4 top-4  z-10  hidden gap-2 xl:flex">
              {/* <button onClick={handleToggleView}>Toggle View</button> */}

              {/* {slides && slides.length !== 0 ? <ViewToggle /> : null} */}
              {!isWidget && <ModeToggle side="bottom" />}
            </div>

            {view === "slides" && slides.length !== 0 ? (
              <div className="fixed bottom-8 right-8 h-[40px] shadow-md">
                <Button
                  className="h-[40px] w-[40px] rounded-none border border-r-0 border-gray-700 p-0 dark:border-gray-200"
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
            ) : null}
          </div>
        </AudioManagerProvider>
      </ThemeProvider>
    )
  );
};
