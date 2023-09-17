"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Icons } from "@/components/Icons";
import { AlignLeft, AlignCenter, AlignRight, ChevronDown } from "lucide-react";
import { ReactEditor } from "slate-react";
import { EditorContext } from "../../contexts/EditorContext";
import { Transforms, Element as SlateElement, Editor, Range } from "slate";
import { cn } from "@/utils/cn";
import { BiCaretDown } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";

export function BlockAlign({ element, className }: any) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { editor, activePath } = React.useContext(EditorContext);

  const path = ReactEditor.findPath(editor, element);

  const alignImage = (position: string) => {
    // If selection exists
    if (editor.selection) {
      // Loop over all nodes in the selection
      for (const [node, path] of Editor.nodes(editor, {
        at: editor.selection,
      })) {
        // If the node is an element and not an image or map
        if (
          SlateElement.isElement(node) &&
          node.type !== "image" &&
          node.type !== "map"
        ) {
          const newElement = { ...node, align: position };
          Transforms.setNodes(editor, newElement, { at: path });
        }
      }
    }

    // Preserve previous logic for images and maps
    if (element.type === "image" || element.type === "map") {
      const newElement = { ...element, align: position };
      Transforms.setNodes(editor, newElement, { at: path });
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger>
          <DropdownMenu onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                className={cn(
                  `flex h-[22px] w-[32px] items-center rounded-md border-0 border-gray-500 bg-white px-1 text-gray-500 hover:bg-gray-200 dark:border-foreground dark:bg-muted dark:text-foreground hover:dark:bg-muted/90`,
                  className
                )}
              >
                {element.align === "start" && <AlignLeft className="h-5 w-6" />}
                {element.align === "center" && (
                  <AlignCenter className="h-5 w-6" />
                )}
                {element.align === "end" && <AlignRight className="h-5 w-6" />}
                <FaCaretDown className="h-4 w-2" />
                <span className="sr-only">Toggle Align</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="border border-gray-300  bg-background dark:border-accent"
            >
              <DropdownMenuItem onClick={() => alignImage("start")}>
                <AlignLeft
                  className={`mr-2 h-4 w-4 ${
                    element.align === "start"
                      ? "stroke-foreground"
                      : "dark:stroke-muted-foreground"
                  }`}
                />
                <span
                  className={`${
                    element.align === "start"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Left
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alignImage("center")}>
                <AlignCenter
                  className={`mr-2 h-4 w-4 ${
                    element.align === "center"
                      ? "stroke-foreground"
                      : "dark:stroke-muted-foreground"
                  }`}
                />
                <span
                  className={`${
                    element.align === "center"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Center
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alignImage("end")}>
                <AlignRight
                  className={`mr-2 h-4 w-4 ${
                    element.align === "end"
                      ? "stroke-foreground"
                      : "dark:stroke-muted-foreground"
                  }`}
                />
                <span
                  className={`${
                    element.align === "end"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Right
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        {dropdownOpen ? null : (
          <TooltipContent side="top" sideOffset={10}>
            <p className="text-[12px]">Align</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
