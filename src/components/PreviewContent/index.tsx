import { EditorContext } from "@/contexts/EditorContext";
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useCallback,
  useRef,
} from "react";
import { Path, Text, Node } from "slate";
import { BiSolidQuoteLeft, BiSolidQuoteRight } from "react-icons/bi";
import { BlockMath, InlineMath } from "react-katex";
import { CollapsibleAudioPlayer } from "@/components/PreviewContent/PreviewElements/CollapsibleAudio";
import { MCQ } from "@/components/PreviewContent/PreviewElements/MCQ";
import { MapBlock } from "@/components/PreviewContent/PreviewElements/Map";
import { useTheme } from "next-themes";

import {
  findAllNumberedLists,
  ListItem,
} from "../DocumentEditor/EditorElements";
import { Checkbox } from "../ui/checkbox";
import { alignMap } from "../DocumentEditor/helpers/toggleBlock";
import { getHtmlFromSelection } from "@/utils/htmlSerialiser";

const NumberedListItem = ({ node, children, key, index, nodes }) => {
  const { editor } = useContext(EditorContext);
  // Find all numbered-list elements within the editor
  const numberedLists = findAllNumberedLists(editor.children);

  // Find the corresponding list group for this node
  const listGroup = numberedLists.find((list) => list.id === node.id);

  // Calculate the list number based on its position within the list group
  const listNumber = listGroup ? listGroup.listIndex + 1 : index + 1;

  return (
    <ol className="list-inside list-decimal" key={key}>
      <li>{`${listNumber}. ${children}`}</li>
    </ol>
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
  nodes: any
) => {
  const numberedLists = findAllNumberedLists(nodes);

  switch (node.type) {
    case "paragraph":
      return (
        <p className="mt-2 leading-7" key={key}>
          {children}
        </p>
      );

    case "inline-equation":
      return (
        <span className="px-1" key={key}>
          <InlineMath math={node.latex} />
        </span>
      );

    case "equation":
      return (
        <div className="mb-1 mt-1 flex justify-center" key={key}>
          <BlockMath math={node.latex} />
        </div>
      );
    case "image":
      return (
        <div className={`flex justify-${node.align}`}>
          <img
            src={node.url}
            width={node.width}
            height={node.height}
            className="rounded-md"
          />
        </div>
      );

    case "map":
      return <MapBlock element={node} />;
    case "block-quote":
      return (
        <blockquote className="text-red  relative mb-3  ml-3 mt-4 border-l-4 border-gray-400 pl-4 text-gray-500 dark:text-gray-300 ">
          {children}
        </blockquote>
      );

    case "title":
      return (
        <h1 className="mb-4 text-[28px] font-bold" key={key}>
          {children}
        </h1>
      );
    case "heading-one":
      return (
        <h1 className="mt-3  text-4xl" key={key}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 className="mt-3  text-3xl" key={key}>
          {children}
        </h2>
      );

    case "heading-three":
      return (
        <h3 className="mt-3  text-2xl" key={key}>
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
        <li className="mt-2 list-inside list-disc " key={key}>
          {children}
        </li>
      );

    case "numbered-list":
      // Find the corresponding list group for this node
      return (
        <div className="mt-2 ">
          <ListItem
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
        <div className="mt-2 ">
          <ListItem
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
        `}
        >
          <Checkbox
            checked={node.checked}
            className="absolute  -translate-x-[24px] translate-y-[4px] cursor-auto"
          />
          {children}
        </div>
      );

    default:
      return <span key={key}>{children}</span>;
  }
};

export const parseNodes = (nodes: any[]) => {
  return nodes.map((node: any, index: any) => {
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
      return renderElement(
        node,
        children,
        node.id ? node.id : index,
        index,
        nodes
      );
    }
  });
};

export const PreviewContent = () => {
  const { editor: fromEditor, activePath } = useContext(EditorContext);
  const [localValue, setLocalValue] = useState(fromEditor.children);

  // update localValue when fromEditor.children changes
  const { theme } = useTheme();
  const total = fromEditor.children.length;
  useEffect(() => {
    setLocalValue(fromEditor.children);
  }, [fromEditor.children]);

  return (
    <div
      className={`relative overflow-y-auto rounded-md border border-gray-300 p-3 dark:border-accent dark:bg-muted`}
    >
      {parseNodes(localValue)}
    </div>
  );
};
