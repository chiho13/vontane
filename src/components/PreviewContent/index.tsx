import { EditorContext } from "@/contexts/EditorContext";
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useRef,
} from "react";
import { createEditor, Text } from "slate";
import { withReact } from "slate-react";
import { AudioElement } from "./PreviewElements/AudioElement";
import { useRouter } from "next/router";
import LoadingSpinner from "@/icons/LoadingSpinner";

import AudioPlayer from "@/components/AudioPlayer";
import { useTextSpeech } from "@/contexts/TextSpeechContext";

export const PreviewContent = ({ viewport }) => {
  const { editor: fromEditor } = useContext(EditorContext);
  const [localValue, setLocalValue] = useState(fromEditor.children);
  const editor = useMemo(() => withReact(createEditor()), []);
  const router = useRouter();

  const scrollRef = useRef(null);
  const { rightBarAudioIsLoading } = useTextSpeech();

  useEffect(() => {
    const isLoading = fromEditor.children.some((node) => node.loading);
    if (isLoading) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setLocalValue(fromEditor.children);
    }
  }, [fromEditor.children]);

  console.log(fromEditor.children);

  const renderElement = (node, children, key) => {
    switch (node.type) {
      case "paragraph":
        return (
          <p className="mt-2 leading-7" key={key}>
            {children}
          </p>
        );
      case "tts":
        return (
          <div key={key}>
            {node.file_name === "" && (
              <div className="flex items-center ">
                <LoadingSpinner />
                <span className="ml-3 ">Generating...</span>
              </div>
            )}
            {node.file_name && (
              <AudioPlayer
                id={node.id}
                audioURL={node.audio_url}
                fileName={node.file_name}
              />
            )}
            {children}
          </div>
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
          return renderElement(node, children, node.id ? node.id : index);
        }
      });
  };

  return (
    <div
      className={`relative overflow-y-auto rounded-md border border-gray-300 p-3 dark:border-gray-700`}
      style={{
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
      }}
    >
      {parseNodes(localValue)}
    </div>
  );
};
