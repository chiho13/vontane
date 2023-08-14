import { EditorContext } from "@/contexts/EditorContext";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";

export const FontStyle = () => {
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;

  const { workspaceData, refetchWorkspaceData, fontStyle, setFontStyle } =
    useTextSpeech();

  useEffect(() => {
    setFontStyle(workspaceData.workspace.font_style);
  }, [workspaceData, router.isReady]);

  const changeFontMutation = api.workspace.changeFont.useMutation();

  const changeFontHandler = async (event) => {
    setFontStyle(event.target.value);
    try {
      await changeFontMutation.mutateAsync({
        id: workspaceId,
        font: event.target.value,
      });
    } catch (error) {
      console.error("Error changing font:", error);
    }
  };

  return (
    <div className="p-3">
      <h4 className="text-sm font-bold text-foreground">Workspace Style</h4>
      <div className="mt-4 grid w-[240px] grid-cols-3 gap-2 ">
        <label
          className={`cursor-pointer  rounded-lg  p-2 text-center transition duration-200 hover:bg-gray-200  dark:hover:bg-accent ${
            fontStyle === "font-sans"
              ? " bg-gray-200 text-brand dark:bg-accent"
              : "text-gray-800 dark:text-gray-300"
          }`}
        >
          <input
            type="radio"
            value="font-sans"
            checked={fontStyle === "font-sans"}
            onChange={changeFontHandler}
            className="sr-only"
          />
          <div className="text-3xl">Ag</div>

          <div className="text-sm text-muted-foreground">Default</div>
        </label>
        <label
          className={`cursor-pointer  rounded-lg p-2 text-center transition duration-200 hover:bg-gray-200 dark:hover:bg-accent ${
            fontStyle === "font-serif"
              ? "bg-gray-200 text-brand dark:bg-accent"
              : "text-gray-800 dark:text-gray-300"
          }`}
        >
          <input
            type="radio"
            value="font-serif"
            checked={fontStyle === "font-serif"}
            onChange={changeFontHandler}
            className="sr-only"
          />
          <div className="font-serif text-3xl">Ag</div>

          <div className="text-sm text-muted-foreground">Serif</div>
        </label>
        <label
          className={`cursor-pointer  rounded-lg p-2 text-center transition duration-200 hover:bg-gray-200 dark:hover:bg-accent ${
            fontStyle === "font-mono"
              ? "bg-gray-200 text-brand dark:bg-accent"
              : "text-gray-800 dark:text-gray-300"
          }`}
        >
          <input
            type="radio"
            value="font-mono"
            checked={fontStyle === "font-mono"}
            onChange={changeFontHandler}
            className="sr-only"
          />
          <div className="font-mono text-3xl">Ag</div>

          <div className="text-sm text-muted-foreground">Mono</div>
        </label>
      </div>
    </div>
  );
};
