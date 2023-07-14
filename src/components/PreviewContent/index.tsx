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

import { CollapsibleAudioPlayer } from "@/components/PreviewContent/PreviewElements/CollapsibleAudio";
import { MCQ } from "@/components/PreviewContent/PreviewElements/MCQ";

export const PreviewContent = () => {
  const { editor: fromEditor, activePath } = useContext(EditorContext);
  const [localValue, setLocalValue] = useState(fromEditor.children);

  // update localValue when fromEditor.children changes
  useEffect(() => {
    setLocalValue(fromEditor.children);
  }, [fromEditor.children]);

  const rootNode = useMemo(() => {
    let path = activePath ? JSON.parse(activePath) : [];
    while (path && path.length > 1) {
      path = Path.parent(path);
    }
    return path.length ? Node.get(fromEditor, path) : null;
  }, [fromEditor, activePath]);

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

  const renderElement = (
    node: { type: any },
    children:
      | string
      | number
      | boolean
      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
      | React.ReactFragment
      | null
      | undefined,
    key: React.Key | null | undefined,
    rootNode: Node | null
  ) => {
    console.log(node.type);

    switch (node.type) {
      case "paragraph":
        return (
          <p className="mt-2 leading-7" key={key}>
            {children}
          </p>
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
      case "heading-three":
        return (
          <h3 className="text-2xl" key={key}>
            {children}
          </h3>
        );
      case "tts":
        // Check if any child node is of type "mcq"
        // Check if any child node is of type "mcq"

        return (
          <CollapsibleAudioPlayer node={node}>
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

  const parseNodes = (nodes: any[]) => {
    return nodes
      .filter((node: any) => node.type !== "title")
      .map((node: any, index: any) => {
        console.log(node);
        if (Text.isText(node)) {
          let customNode = node as any; // assert that node could be any type
          if (customNode.bold) {
            return <b key={index}>{customNode.text}</b>;
          } else if (customNode.italic) {
            return <i key={index}>{customNode.text}</i>;
          } else if (customNode.underline) {
            return <u key={index}>{customNode.text}</u>;
          } else if (customNode.strikethrough) {
            return <del key={index}>{customNode.text}</del>;
          } else {
            return <span key={index}>{customNode.text}</span>;
          }
        } else if ("children" in node) {
          const children = parseNodes(node.children);
          return renderElement(
            node,
            children,
            node.id ? node.id : index,
            rootNode
          );
        }
      });
  };

  return (
    <div
      className={`relative overflow-y-auto rounded-md border border-gray-300 p-3 dark:border-gray-700`}
    >
      {parseNodes(localValue)}
    </div>
  );
};
