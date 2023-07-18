import * as React from "react";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/AudioPlayer";
import { AudioManagerContext } from "@/contexts/PreviewAudioContext";

export const CollapsibleAudioPlayer = ({ node, children }) => {
  const containsMCQ = node.children.some((child) => child.type === "mcq");
  const containsBlockQuote = node.children.some(
    (child) => child.type === "block-quote"
  );
  const flexInline = node.content.length < 40;
  console.log(flexInline);

  return (
    <div
      className={` mb-3 mt-3  rounded-md border p-2 dark:border-accent ${
        flexInline ? "flex items-center pb-4 " : ""
      }`}
    >
      {node.audio_url && !containsMCQ && (
        <div className="mt-2 rounded-md">
          <AudioPlayer
            id={node.id}
            audioURL={node.audio_url}
            fileName={node.file_name}
            content={node.content}
            classNames="py-0 shadow-none border-0"
            isPreview={true}
          />
        </div>
      )}
      {/* {BlockQuote}
       */}
      {children}
    </div>
  );
};
