import { EditorContext } from "@/contexts/EditorContext";
import React, { useContext, useEffect, useState } from "react";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { parseNodes } from "@/utils/renderHelpers";

export const SlidesPreview = () => {
  const { editor: fromEditor, activePath } = useContext(EditorContext);
  const [localValue, setLocalValue] = useState(fromEditor.children);

  const { workspaceData } = useTextSpeech();
  // update localValue when fromEditor.children changes

  const fontFam = workspaceData.workspace.font_style;

  useEffect(() => {
    setLocalValue(fromEditor.children);
  }, [fromEditor.children]);

  // Check if editor.children contains any nodes of type "slide"
  const hasSlides = localValue.some((node) => node.type === "slide");

  if (!hasSlides) {
    return (
      <div className=" p-5 dark:border-accent dark:bg-muted">
        <p>No slides found</p>
        <p>Add Slide Breaks to get started</p>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-y-auto p-5 dark:border-accent dark:bg-muted`}
    >
      {parseNodes(localValue, fontFam)}
    </div>
  );
};
