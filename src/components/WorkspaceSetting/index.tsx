import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal } from "lucide-react";
import { Export } from "../Export";

import { FontStyle } from "../FontStyle";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { Icons } from "@/components/Icons";
import { Laptop } from "lucide-react";

export const WorkspaceSettingInside = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <FontStyle />
      <div className="border-t p-3  dark:border-gray-700">
        {/* <Export /> */}

        <h4 className="text-sm font-bold text-foreground">Appearance</h4>

        <div className="grid grid-cols-3 gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setTheme("light")}
            className={`flex h-[80px] flex-col items-center justify-center border-0   focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground
              ${
                theme === "light"
                  ? "ring-2 ring-brand hover:bg-transparent"
                  : ""
              }
              `}
            aria-label="Switch theme to light"
          >
            <Icons.sun className="h-6 w-6 grow text-foreground" />
            <span className="text-sm text-muted-foreground">Light</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setTheme("dark")}
            className={`flex h-[80px] flex-col items-center justify-center border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground
            ${theme === "dark" ? "ring-2 ring-brand hover:bg-transparent" : ""}
              `}
            aria-label="Switch theme to dark"
          >
            <Icons.moon className="h-6 w-6 grow text-foreground" />
            <span className="text-sm text-muted-foreground">Dark</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setTheme("system")}
            className={`flex h-[80px] flex-col items-center justify-center border-0  focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground
            ${
              theme === "system" ? "ring-2 ring-brand hover:bg-transparent" : ""
            }
              `}
            aria-label="Switch theme to system theme"
          >
            <Laptop className="h-6 w-6 grow text-foreground" />
            <span className="text-sm text-muted-foreground">System</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

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
        <WorkspaceSettingInside />
      </PopoverContent>
    </Popover>
  );
};
