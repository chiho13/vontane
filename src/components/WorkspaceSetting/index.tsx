import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal } from "lucide-react";
import { Export } from "../Export";
import React from "react";
import { FontStyle } from "../FontStyle";
import { Button } from "../ui/button";

export const WorkspaceSetting = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={`text-bold  flex h-[28px] w-[30px] items-center justify-center rounded-md border-0 bg-gray-200/70 p-0 text-sm text-white ring-brand hover:bg-gray-300/70 focus-visible:ring-2 disabled:opacity-100  dark:bg-gray-100/10 dark:text-muted dark:ring-white dark:hover:bg-gray-200/20`}
        >
          <MoreHorizontal className="w-4 text-foreground " />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        sideOffset={10}
        className="w-[320px] border border-gray-300  bg-background p-0 dark:border-gray-700 dark:bg-secondary"
      >
        <FontStyle />
        <div className="border-t p-3  dark:border-gray-700">
          <Export />
        </div>
      </PopoverContent>
    </Popover>
  );
};
