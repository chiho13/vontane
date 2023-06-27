import { EditorContext } from "@/contexts/EditorContext";
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useRef,
} from "react";
import { createEditor, Path, Text, Node } from "slate";
import { withReact } from "slate-react";
import { useRouter } from "next/router";
import LoadingSpinner from "@/icons/LoadingSpinner";

import AudioPlayer from "@/components/AudioPlayer";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { CollapsibleAudioPlayer } from "@/components/PreviewContent/PreviewElements/CollapsibleAudio";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const PreviewContent = ({ viewport }) => {
  const { editor: fromEditor, activePath } = useContext(EditorContext);
  const [localValue, setLocalValue] = useState(fromEditor.children);
  const editor = useMemo(() => withReact(createEditor()), []);
  const router = useRouter();

  const scrollRef = useRef(null);
  const { rightBarAudioIsLoading } = useTextSpeech();

  const rootNode = useMemo(() => {
    let path = activePath ? JSON.parse(activePath) : [];
    while (path && path.length > 1) {
      path = Path.parent(path);
    }
    return path.length ? Node.get(fromEditor, path) : null;
  }, [fromEditor, activePath]);

  useEffect(() => {
    const isLoading = fromEditor.children.some((node) => node.loading);
    if (isLoading) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setLocalValue(fromEditor.children);
    }
  }, [fromEditor.children]);

  console.log(fromEditor.children);

  const renderElement = (node, children, key, rootNode) => {
    switch (node.type) {
      case "paragraph":
        return (
          <p className="mt-2 leading-7" key={key}>
            {children}
          </p>
        );
      case "tts":
        console.log(node.audioplayer);
        return (
          <CollapsibleAudioPlayer node={node} children={children} key={key} />
        );
      default:
        return <span key={key}>{children}</span>;
    }
  };

  const parseNodes = (nodes) => {
    return nodes
      .filter((node) => node.type !== "title")
      .map((node, index) => {
        if (Text.isText(node)) {
          if (node.bold) {
            return <b key={index}>{node.text}</b>;
          } else {
            return <span key={index}>{node.text}</span>;
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
      {/* {containsTtsNode(localValue) && (
        <button className="mb-2 flex h-[28px] items-center justify-center rounded-md border border-muted-foreground bg-background p-1 text-xs  text-muted-foreground hover:border-gray-700 hover:bg-white hover:text-gray-700 dark:border-muted-foreground dark:bg-secondary dark:text-foreground dark:hover:bg-muted">
          Export as Single Audio File
        </button>
      )} */}
      {parseNodes(localValue)}
    </div>
  );
};
