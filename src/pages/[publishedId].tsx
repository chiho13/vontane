import { EditorContext, EditorProvider } from "@/contexts/EditorContext";
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useRef,
  useLayoutEffect,
} from "react";
import { Path, Text, Node } from "slate";
import Link from "next/link";

import { api } from "@/utils/api";
import { CollapsibleAudioPlayer } from "@/components/PreviewContent/PreviewElements/CollapsibleAudio";
import { MCQ } from "@/components/PreviewContent/PreviewElements/MCQ";
import { useRouter } from "next/router";
import { ModeToggle } from "@/components/mode-toggle";
import { AudioManagerProvider } from "@/contexts/PreviewAudioContext";
import { createInnerTRPCContext } from "@/server/api/trpc";
import { GetServerSideProps } from "next";
import { Button } from "@/components/ui/button";
import { parseNodes, splitIntoSlides } from "@/utils/renderHelpers";
import { createClient } from "@supabase/supabase-js";
import { supabaseClient } from "@/utils/supabaseClient";
import { SlideBreak } from "@/icons/SlideBreak";
import { useLocalStorage } from "usehooks-ts";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { ViewToggle } from "@/components/view-toggle";

export const getServerSideProps: GetServerSideProps = async (context) => {
  // get the entire URL path
  const path = context.resolvedUrl;
  let parts = path.split("-");
  let workspaceId = parts.slice(1).join("-").split("?")[0];
  try {
    const { req, res }: any = context;
    const { prisma } = createInnerTRPCContext({}, req, res);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace.published) {
      throw new Error("Workspace not found");
    }

    // If there is a user, return the session and other necessary props.
    return {
      props: {
        workspaceData: workspace.slate_value,
        font: workspace.font_style,
      }, // Replace 'user' with your actual session data
    };
  } catch (error) {
    return {
      props: {
        workspaceId,
        workspaceData: null,
      },
    };
  }
};

const PublishedPage = ({ workspaceId, workspaceData, font }) => {
  const router = useRouter();
  const view = router.query.view || "one-page";

  const [localValue, setLocalValue] = useState(null);

  const [currentSlideIndex, setCurrentSlideIndex] = useLocalStorage(
    "publishedSlideIndex",
    0
  );
  useEffect(() => {
    if (workspaceData) {
      const parsedSlateValue = JSON.parse(workspaceData);
      setLocalValue(parsedSlateValue);
    }

    return () => {
      setLocalValue(null);
    };
  }, [workspaceData]);

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

  if (slides && slides.length === 0 && view === "slides") {
    return (
      <div className="flex h-[100vh] w-full items-center justify-center">
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
      <div className="flex h-[100vh] w-full flex-col items-center justify-center">
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
      <AudioManagerProvider>
        {view === "slides" ? (
          <div className=" sticky top-0  flex gap-3 border-b border-accent  p-5  text-gray-700  dark:bg-[#191919] dark:text-gray-200">
            <span className=" flex min-w-[50px]">
              <span className="flex w-[20px] justify-center ">
                {currentSlideIndex + 1}
              </span>{" "}
              / {slides.length}
            </span>
            <span className="font-bold">{localValue[0].children[0].text}</span>
          </div>
        ) : null}
        {view === "one-page" ? (
          <div
            className={`relative  h-[100vh] overflow-y-auto rounded-md bg-white p-4 dark:bg-[#191919] `}
          >
            <div className=" relative mx-auto mb-20 max-w-[680px] xl:mt-[100px]">
              {parseNodes(localValue, font)}
            </div>
          </div>
        ) : (
          <div
            className={`relative  overflow-y-auto rounded-md bg-white p-4 pb-[100px] dark:bg-[#191919] `}
            style={{
              height: "calc(100vh - 65px)",
            }}
          >
            <div className=" relative mx-auto max-w-[880px] xl:mt-[60px]">
              {parseNodes(slides[currentSlideIndex], font, true)}
            </div>
          </div>
        )}
        <div className="fixed right-4 top-4  z-10  hidden gap-2 xl:flex">
          {/* <button onClick={handleToggleView}>Toggle View</button> */}

          {slides.length !== 0 ? <ViewToggle /> : null}
          <ModeToggle />
        </div>
        <div className="fixed bottom-8 right-8  shadow-md">
          <Button
            className="h-[44px] w-[44px] rounded-none border border-r-0 border-gray-700 p-0 dark:border-gray-200"
            onClick={handlePrevious}
            disabled={currentSlideIndex === 0}
          >
            <ArrowLeft className="h-8 w-8 stroke-accent" />
          </Button>
          <Button
            className={cn(
              `h-[44px] w-[44px] rounded-none border border-gray-700 p-0  disabled:border-l-0  ${
                currentSlideIndex === 0 && "border-l-0"
              } dark:border-gray-200`
            )}
            onClick={handleNext}
            disabled={currentSlideIndex === slides.length - 1}
          >
            <ArrowRight className="h-8 w-8 stroke-accent" />
          </Button>
        </div>
      </AudioManagerProvider>
    )
  );
};

export default PublishedPage;
