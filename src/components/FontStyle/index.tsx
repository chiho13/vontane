import { EditorContext } from "@/contexts/EditorContext";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { debounce } from "lodash";

export const FontStyle = () => {
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;

  const { workspaceData, refetchWorkspaceData, fontStyle, setFontStyle } =
    useTextSpeech();

  const [color, setColor] = useState(
    workspaceData.workspace.brand_color || "#0E78EF"
  );

  useEffect(() => {
    setFontStyle(workspaceData.workspace.font_style);
    if (workspaceData.workspace.brand_color) {
      setColor(workspaceData.workspace.brand_color);
    }
  }, [workspaceData, router.isReady]);

  const changeFontMutation = api.workspace.changeFont.useMutation();
  const changeBrandColorMutation =
    api.workspace.changeBrandColour.useMutation();

  const changeFontHandler = async (event) => {
    setFontStyle(event.target.value);
    try {
      const response = await changeFontMutation.mutateAsync({
        id: workspaceId,
        font: event.target.value,
      });
      if (response) {
        refetchWorkspaceData();
      }
    } catch (error) {
      console.error("Error changing font:", error);
    }
  };

  const changeBrandColourHandler = async (value) => {
    try {
      const response = await changeBrandColorMutation.mutateAsync({
        id: workspaceId,
        brandColor: value,
      });
      if (response) {
        // setColor(value);
        refetchWorkspaceData();
      }
    } catch (error) {
      console.error("Error changing brand color:", error);
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
              : "text-gray-800 dark:text-gray-200"
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
              : "text-gray-800 dark:text-gray-200"
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
              : "text-gray-800 dark:text-gray-200"
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
      <div className="mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 border border-gray-300  bg-white px-[6px] text-gray-700 dark:border-accent dark:bg-muted  dark:text-gray-200 dark:hover:bg-accent/80"
            >
              <span
                className="h-[24px] w-[24px] rounded-md"
                style={{
                  backgroundColor: color,
                }}
              ></span>
              Brand Colour <ChevronDown className="w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="z-100 border border-gray-400 bg-background  p-2 dark:border-gray-700  dark:bg-muted "
          >
            <HexColorPicker
              color={color}
              onChange={debounce(changeBrandColourHandler, 400)}
            />
            <div className="mb-1 mt-2 w-full">
              <HexColorInput
                color={color}
                onChange={debounce(changeBrandColourHandler, 400)}
                className="h-[32px] w-full rounded-md  border border-neutral-300 px-1"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
