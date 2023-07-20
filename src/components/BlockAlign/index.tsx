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
import { Transforms } from "slate";

export function BlockAlign({ element }: any) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { editor } = React.useContext(EditorContext);

  const path = ReactEditor.findPath(editor, element);

  const alignImage = (position: string) => {
    const newElement = { ...element, align: position };

    Transforms.setNodes(editor, newElement, { at: path });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger>
          <DropdownMenu onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button className=" flex h-[22px] w-[32px] items-center rounded-md border-0 border-gray-500 bg-white px-1 text-gray-500 hover:bg-gray-200 dark:border-foreground dark:bg-muted dark:text-foreground hover:dark:bg-muted/90 ">
                {element.align === "start" && <AlignLeft className="h-4 w-4" />}
                {element.align === "center" && (
                  <AlignCenter className="h-4 w-4" />
                )}
                {element.align === "end" && <AlignRight className="h-4 w-4" />}
                <ChevronDown className="h-3 w-3" />
                <span className="sr-only">Toggle Align</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="border-2 border-gray-300  bg-background dark:border-accent"
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
          <TooltipContent
            className="border-black  dark:bg-white dark:text-muted"
            side="top"
            sideOffset={10}
          >
            <p className="text-[12px]">Align</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
