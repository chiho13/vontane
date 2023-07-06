import * as React from "react";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/AudioPlayer";
import { AudioManagerContext } from "@/contexts/PreviewAudioContext";

export const CollapsibleAudioPlayer = ({ node, children, key }) => {
  const containsMCQ = node.children.some((child) => child.type === "mcq");
  return (
    <div className="mb-3  space-y-4 rounded-md border p-2 dark:border-gray-700">
      {node.audio_url && !containsMCQ && (
        <div key={key} className="mt-2 w-full rounded-md">
          <AudioPlayer
            id={node.id}
            audioURL={node.audio_url}
            fileName={node.file_name}
            classNames="py-0 shadow-none border-0"
            isPreview={true}
          />
        </div>
      )}

      <div>{children}</div>
    </div>
  );
};
