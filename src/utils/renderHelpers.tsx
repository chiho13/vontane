import React, { useEffect, useState } from "react";
import { Text } from "slate";
import { BlockMath, InlineMath } from "react-katex";
import { ListItem } from "@/components/PreviewContent/PreviewElements/ListItem";
import { Checkbox } from "@/components/ui/checkbox";
import { alignMap } from "@/components/DocumentEditor/helpers/toggleBlock";
import { CollapsibleAudioPlayer } from "@/components/PreviewContent/PreviewElements/CollapsibleAudio";
import { MCQ } from "@/components/PreviewContent/PreviewElements/MCQ";
import { MapBlock } from "@/components/PreviewContent/PreviewElements/Map";
import { cn } from "./cn";
import LoadingSpinner from "@/icons/LoadingSpinner";
import { api } from "@/utils/api";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { WidgetRenderer } from "@/components/WidgetRender";

import styled from "styled-components";

interface HotspotProps {
  colour: string;
}

const Hotspot = styled.div<HotspotProps>`
  @keyframes active {
    0% {
      transform: scale(0.1);
      opacity: 1;
    }
    70% {
      transform: scale(1.5);
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  .beacon:before {
    content: "";
    position: absolute;
    height: 30px;
    width: 30px;
    background-color: ${(props) => props.colour};
    border-radius: 50%;
    box-shadow: 0px 0px 2px 2px #ffffff;
    animation: active 2s infinite linear;
  }
`;

const LazyLoadingWidget = ({ src }) => {
  const [workspaceData, setWorkspaceData] = useState(null);
  const { data, error, isLoading, refetch } =
    api.workspace.getPublicWorkspace.useQuery({ id: src });

  useEffect(() => {
    if (!isLoading) {
      if (data) {
        console.log(data);
        setWorkspaceData(data.workspace);
      }
    }
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-[410px] -translate-y-[30px] items-center justify-center">
        <LoadingSpinner
          width={50}
          height={50}
          strokeColor="stroke-brand dark:stroke-white"
        />
      </div>
    );
  }
  return (
    <div className="relative h-[410px] w-[360px] overflow-y-auto px-6 sm:w-[610px]">
      {workspaceData && (
        <WidgetRenderer
          key={src}
          workspaceData={workspaceData.slate_value}
          font={workspaceData.font_style}
          brandColor={workspaceData.brand_color}
          isWidget={true}
        />
      )}
    </div>
  );
};

const renderElement = (
  node: {
    id: string;
    align: any;
    height: string | number;
    width: string | number;
    type: any;
    url: any;
    checked: boolean;
    latex: any;
    audioPoint: any;
  },
  children:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactFragment
    | null
    | undefined,
  key: React.Key | null | undefined,
  index: number,
  nodes: any,
  fontFam: any,
  hideTitle: boolean
) => {
  switch (node.type) {
    // case "title":
    //   if (hideTitle) {
    //     return null;
    //   }
    //   return (
    //     <h1
    //       className={`mb-4 text-[34px] font-bold  dark:text-gray-200 ${fontFam}`}
    //       key={key}
    //     >
    //       {children}
    //     </h1>
    //   );
    case "paragraph":
      return (
        <p
          className={cn(`pt-3 leading-7 text-${
            alignMap[node.align] || node.align
          }
            ${fontFam}
  
            ${fontFam === "font-mono" ? "text-sm leading-6" : ""}
            dark:text-gray-200
            `)}
          key={key}
        >
          {children}
        </p>
      );

    case "inline-equation":
      return (
        <span className="pointer-events-none px-1 dark:text-gray-200" key={key}>
          <InlineMath math={node.latex} />
        </span>
      );

    case "equation":
      return (
        <div
          className="mb-4 mt-4 flex justify-center dark:text-gray-200"
          key={key}
        >
          <BlockMath math={node.latex} />
        </div>
      );
    case "image":
      return (
        <div className={`relative flex justify-${node.align} mt-3`}>
          <img
            src={node.url}
            width={node.width}
            height={node.height}
            className="rounded-md shadow-md"
          />
          {node.audioPoint &&
            node.audioPoint.map((el, i) => {
              let isLoading = true;
              return (
                <Hotspot
                  key={i}
                  className="absolute"
                  style={{ left: `${el.x}%`, top: `${el.y}%` }}
                  colour={el.colour}
                >
                  <Dialog>
                    <DialogTrigger>
                      <button
                        className="beacon flex h-[24px] w-[24px] items-center justify-center  rounded-full border-2 shadow-lg ring-1 ring-gray-400"
                        style={{
                          borderColor: el.colour || "#ffffff",
                        }}
                      >
                        <div
                          className="h-[12px] w-[12px] rounded-full border border-gray-400"
                          style={{
                            backgroundColor: el.colour || "#ffffff",
                          }}
                        ></div>
                      </button>
                    </DialogTrigger>

                    <DialogContent className="max-h-[500px]  max-w-[380px] border  border-accent px-1 text-foreground dark:bg-[#191919] sm:max-w-[620px]">
                      <DialogTitle className="px-6 pb-6 text-3xl">
                        {el.label}
                      </DialogTitle>
                      {el.link && <LazyLoadingWidget src={el.link} />}
                    </DialogContent>
                  </Dialog>
                </Hotspot>
              );
            })}
        </div>
      );

    case "map":
      return <MapBlock element={node} />;
    case "block-quote":
      return (
        <blockquote
          className={`text-red  relative mb-3  ml-3 mt-4 border-l-4 border-gray-400 pl-4 text-gray-500 dark:text-gray-200
            ${fontFam}
          `}
        >
          {children}
        </blockquote>
      );

    case "heading-one":
      return (
        <h1
          className={`mt-3 pb-4   text-4xl font-bold lg:text-5xl text-${
            alignMap[node.align] || node.align
          }
            ${fontFam}
            dark:text-gray-200
            `}
          key={key}
        >
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2
          className={`mt-3  text-2xl font-bold lg:text-3xl text-${
            alignMap[node.align] || node.align
          }
            ${fontFam}
            dark:text-gray-200
            `}
          key={key}
        >
          {children}
        </h2>
      );

    case "heading-three":
      return (
        <h3
          className={`mt-3 text-xl font-bold  lg:text-2xl text-${
            alignMap[node.align] || node.align
          }
            ${fontFam}
            dark:text-gray-200
            `}
          key={key}
        >
          {children}
        </h3>
      );
    case "link":
      return (
        <a
          href={node.url}
          target="_blank"
          className="inline text-brand underline dark:text-blue-400"
        >
          {children}
        </a>
      );
    case "heading-three":
      return (
        <h3 className="mt-2 text-2xl" key={key}>
          {children}
        </h3>
      );
    case "tts":
      return (
        <CollapsibleAudioPlayer
          node={node}
          key={key}
          index={index}
          nodes={nodes}
        >
          {children}
        </CollapsibleAudioPlayer>
      );
    case "mcq":
      return (
        <MCQ node={node} key={key}>
          {children}
        </MCQ>
      );
    case "bulleted-list":
      return (
        <li className={`mt-2 list-inside list-disc  ${fontFam}`} key={key}>
          {children}
        </li>
      );

    case "numbered-list":
      // Find the corresponding list group for this node
      return (
        <div className={`mt-2  ${fontFam}`}>
          <ListItem
            nodes={nodes}
            element={node}
            children={children}
            key={key}
            listType="numbered"
            isPreview={true}
          />
        </div>
      );
    case "option-list-item":
      // Find the corresponding list group for this node
      return (
        <div className={`mt-2  ${fontFam}`}>
          <ListItem
            nodes={nodes}
            element={node}
            children={children}
            key={key}
            listType="options"
            isPreview={true}
          />
        </div>
      );
    case "checked-list":
      // Find the corresponding list group for this node
      return (
        <div
          className={`
            ml-[21px]
           mt-2 list-none transition
        duration-200 ease-in-out
        text-${alignMap[node.align] || node.align}
          ${node.checked && "text-muted-foreground line-through"}
  
          ${fontFam}
          `}
        >
          <Checkbox
            checked={node.checked}
            className="absolute  -translate-x-[24px] translate-y-[4px] cursor-auto"
          />
          {children}
        </div>
      );

    case "column":
      return (
        <div className="grid w-full grid-cols-2 items-start gap-4  pb-1 pt-1">
          {children}
        </div>
      );
    case "column-cell":
      return <div>{children}</div>;

    default:
      return <div></div>;
  }
};

export const parseNodes = (nodes: any[], fontFam, hideTitle = false) => {
  return (
    nodes &&
    nodes.map((node: any, index: any) => {
      if (Text.isText(node)) {
        let customNode = node as any; // assert that node could be any type

        let component =
          customNode.text !== "" ? (
            <span key={index}>{customNode.text}</span>
          ) : (
            "\u00A0"
          );

        if (customNode.bold) {
          component = <b key={index}>{component}</b>;
        }

        if (customNode.italic) {
          component = <i key={index}>{component}</i>;
        }

        if (customNode.underline) {
          component = <u key={index}>{component}</u>;
        }

        if (customNode.strikethrough) {
          component = <del key={index}>{component}</del>;
        }

        return component;
      } else if ("children" in node) {
        const children = parseNodes(node.children, fontFam, hideTitle);
        return renderElement(
          node,
          children,
          node.id ? node.id : index,
          index,
          nodes,
          fontFam,
          hideTitle
        );
      }
    })
  );
};

export const splitIntoSlides = (nodes: any[]) => {
  const slides = [];
  let currentSlide = [];

  // Check if there are any nodes of type "slide"
  if (!nodes.some((node) => node.type === "slide")) {
    return []; // Return an empty array if no "slide" nodes
  }

  nodes.forEach((node: any) => {
    if (node.type === "slide") {
      if (currentSlide.length > 0) {
        slides.push(currentSlide); // Push content before the slide break
        currentSlide = []; // Reset currentSlide for content after the slide break
      }
    } else {
      currentSlide.push(node); // Collect nodes for the current slide
    }
  });

  if (currentSlide.length > 0) {
    slides.push(currentSlide); // Push the last slide if there's any content left
  }

  return slides;
};
