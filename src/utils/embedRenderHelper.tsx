import React, { useEffect, useState } from "react";
import { Text } from "slate";
// import { BlockMath, InlineMath } from "react-katex";
// import { ListItem } from "@/components/PreviewContent/PreviewElements/ListItem";
// import { Checkbox } from "@/components/ui/checkbox";
import { alignMap } from "@/components/DocumentEditor/helpers/toggleBlock";
// import { CollapsibleAudioPlayer } from "@/components/PreviewContent/PreviewElements/CollapsibleAudio";
// import { MCQ } from "@/components/PreviewContent/PreviewElements/MCQ";
// import { MapBlock } from "@/components/PreviewContent/PreviewElements/Map";
import { cn } from "./cn";
import LoadingSpinner from "@/icons/LoadingSpinner";
// import { api } from "@/utils/api";

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
import { CollapsibleAudioPlayer } from "@/components/PreviewContent/PreviewElements/CollapsibleAudio";
import { EmbedWidget } from "@/components/EmbedWidget";
import { MapBlock } from "@/components/PreviewContent/PreviewElements/Map";
import { EmbedMapBlock } from "@/components/PreviewContent/PreviewElements/EmbedMap";

const LazyLoadingWidget = ({ src }) => {
  const [workspaceData, setWorkspaceData] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/api/widget?id=${src}`)
      .then((response) => response.json()) // Parsing the JSON data to JavaScript object
      .then((data) => {
        console.log(JSON.parse(data.workspace.slate_value));

        const parsedSlateValue = JSON.parse(data.workspace.slate_value);
        setLoading(false);
        setWorkspaceData(parsedSlateValue);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner
          width={50}
          height={50}
          strokeColor="stroke-blue-500 dark:stroke-white"
        />
      </div>
    );
  }
  return (
    <div className="relative h-[410px] w-[360px] overflow-y-auto px-6 sm:w-[610px]">
      {workspaceData && <EmbedWidget widgetId={src} />}
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
    case "map":
      return <EmbedMapBlock element={node} />;
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
                <div
                  key={i}
                  className="absolute"
                  style={{ left: `${el.x}%`, top: `${el.y}%` }}
                >
                  <Dialog>
                    <DialogTrigger>
                      <button className="beacon  flex h-[24px] w-[24px] items-center justify-center  rounded-full border-2 border-white shadow-lg ring-1 ring-gray-400">
                        <div className="h-[12px] w-[12px] rounded-full border border-gray-400 bg-white"></div>
                      </button>
                    </DialogTrigger>
                    {el.label && (
                      <DialogContent className="max-h-[500px]  max-w-[380px] border  border-accent bg-white px-1 text-foreground dark:bg-[#191919] sm:max-w-[620px]">
                        <DialogTitle className="px-6 pb-6 text-3xl">
                          {el.label}
                        </DialogTitle>
                        {el.link && <LazyLoadingWidget src={el.link} />}
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              );
            })}
        </div>
      );

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
