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
import { Icons } from "@/components/Icons";
import { Eye, File, FileStack } from "lucide-react";
import { useRouter } from "next/router";

export function ViewToggle() {
  const router = useRouter();
  const view = router.query.view;

  const handleToggleView = (newView) => {
    // const newView = view === "one-page" ? "slides" : "one-page";
    router.push({
      pathname: router.pathname,
      query: { ...router.query, view: newView },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 w-8 border border-gray-400 bg-white  px-0 text-gray-700 dark:border-gray-700 dark:bg-muted dark:text-gray-200"
        >
          <Eye />
          <span className="sr-only">Toggle View</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="z-100 border border-gray-400  bg-background  dark:border-gray-700 "
      >
        <DropdownMenuItem onClick={() => handleToggleView("one-page")}>
          <File className="mr-2 h-4 w-4 text-foreground" />
          <span className="text-foreground">One Page</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggleView("slides")}>
          <FileStack className="mr-2 h-4 w-4 text-foreground" />
          <span className="text-foreground">Slides</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
