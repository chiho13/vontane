import * as Icons from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

export const IconPicker = () => {
  const [search, setSearch] = useState("");

  const allIconNames = Object.keys(Icons);
  const filteredIconNames = allIconNames.filter(
    (iconName) =>
      iconName !== "createLucideIcon" &&
      iconName !== "icons" &&
      !iconName.endsWith("Icon")
  );
  console.log(filteredIconNames);
  const iconName = "Accessibility";
  // const IconComponent = Icons[iconName];
  function pascalToSpaces(str) {
    return str.replace(/([A-Z])/g, " $1").trim();
  }
  return (
    <div>
      {/* <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search icons"
      /> */}

      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="flex h-[36px] gap-1 border border-input bg-white hover:bg-gray-100 dark:border-gray-700 dark:bg-background dark:hover:bg-muted"
            size="sm"
            variant="outline"
          >
            Select Icon
          </Button>
        </DialogTrigger>

        <DialogContent className="  max-w-[380px] border border-accent p-0 pb-0 text-foreground dark:bg-[#191919] sm:max-w-[640px]">
          <div className="px-4 py-4">
            <Input className="mb-2 w-[240px]" placeholder="Search Icons" />
          </div>
          <div className=" grid max-h-[500px] grid-cols-10  gap-4  overflow-y-auto px-4 ">
            <button className=" h-[32px] w-[32px] rounded-md p-1 transition duration-300 hover:bg-gray-200 dark:hover:bg-accent ">
              <div className="beacon flex h-[24px] w-[24px] items-center justify-center  rounded-full border-2 border-foreground shadow-lg">
                <div className="h-[12px] w-[12px] rounded-full bg-foreground shadow-lg"></div>
              </div>
            </button>
            {filteredIconNames.map((icon) => {
              const IconComponent = Icons[icon];
              const iconLabel = pascalToSpaces(icon);
              return (
                <button
                  key={icon}
                  className="h-[32px] w-[32px]  rounded-md p-1 p-1 transition duration-300 hover:bg-gray-200 dark:hover:bg-accent"
                >
                  <IconComponent size={24} />
                  <span className="sr-only">{iconLabel}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
