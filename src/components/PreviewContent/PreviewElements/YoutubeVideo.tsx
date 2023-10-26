import LoadingSpinner from "@/icons/LoadingSpinner";
import React, { useState } from "react";

export const YoutubeVideoEmbed = ({ node }) => {
  const [loading, setLoading] = useState(true);

  return (
    <div className={`relative flex justify-${node.align} pb-2 pt-2`}>
      <div
        style={{
          width: `${node.width}px`,
          position: "relative",
        }}
      >
        <div
          style={{
            paddingBottom: "56.25%",
            height: 0,
          }}
        />
        <iframe
          onLoad={() => setLoading(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          src={`${node.embedLink}?start=${node.startTime}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="mt-2 rounded-md bg-black"
        />
      </div>
    </div>
  );
};
