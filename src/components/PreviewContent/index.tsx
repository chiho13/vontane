import { EditorContext } from "@/contexts/EditorContext";
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useRef,
} from "react";
import { Path, Text, Node } from "slate";
import { BiSolidQuoteLeft, BiSolidQuoteRight } from "react-icons/bi";

import { CollapsibleAudioPlayer } from "@/components/PreviewContent/PreviewElements/CollapsibleAudio";
import { MCQ } from "@/components/PreviewContent/PreviewElements/MCQ";

const renderElement = (
  node: { type: any; url: any },
  children:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactFragment
    | null
    | undefined,
  key: React.Key | null | undefined
) => {
  console.log(node.type);

  switch (node.type) {
    case "paragraph":
      return (
        <p className="mt-2 leading-7" key={key}>
          {children}
        </p>
      );

    case "block-quote":
      return (
        <blockquote className="text-red  relative mb-3  ml-3 mt-4 border-l-4 border-gray-400 pl-4 text-gray-500 dark:text-gray-300 ">
          {children}
        </blockquote>
      );
    case "heading-one":
      return (
        <h1 className="text-4xl" key={key}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 className="text-3xl" key={key}>
          {children}
        </h2>
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
        <h3 className="text-2xl" key={key}>
          {children}
        </h3>
      );
    case "tts":
      return (
        <CollapsibleAudioPlayer node={node} key={key}>
          {children}
        </CollapsibleAudioPlayer>
      );
    case "mcq":
      return (
        <MCQ node={node} key={key}>
          {children}
        </MCQ>
      );

    default:
      return <span key={key}>{children}</span>;
  }
};

export const parseNodes = (nodes: any[]) => {
  return nodes
    .filter((node: any) => node.type !== "title")
    .map((node: any, index: any) => {
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
        const children = parseNodes(node.children);
        return renderElement(node, children, node.id ? node.id : index);
      }
    });
};

export const PreviewContent = () => {
  const { editor: fromEditor, activePath } = useContext(EditorContext);
  const [localValue, setLocalValue] = useState(fromEditor.children);

  // update localValue when fromEditor.children changes
  useEffect(() => {
    setLocalValue(fromEditor.children);
  }, [fromEditor.children]);

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

  return (
    <div
      className={`relative overflow-y-auto rounded-md border border-gray-300 p-3 dark:border-accent dark:bg-muted`}
    >
      {parseNodes(localValue)}
    </div>
  );
};
