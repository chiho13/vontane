import * as React from "react";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/AudioPlayer";

const CollapsibleAudioPlayer = ({ node, children, key }) => {
  return (
    <div className="mb-2  space-y-2 rounded-md border p-2">
      {node.file_name && (
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

export default CollapsibleAudioPlayer;
