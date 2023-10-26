import * as Icons from "lucide-react";
import { useMemo, useState } from "react";
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
} from "@/components/ui/dialog";

import { FixedSizeGrid as Grid } from "react-window";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "../ui/button";

export const Beacon = () => (
  <div className="beacon flex h-[24px] w-[24px] items-center justify-center  rounded-full border-2 border-foreground">
    <div className="h-[12px] w-[12px] rounded-full bg-foreground"></div>
  </div>
);

export const IconPicker = ({ onChangeIconType, iconType }) => {
  const [search, setSearch] = useState("");

  const [openIconPickerDialog, setOpenIconPickerDialog] = useState(false);

  const onOpenChange = (value) => {
    setOpenIconPickerDialog(value);
  };

  const allIconNames = Object.keys(Icons);
  const filteredIconNames = allIconNames
    .filter(
      (iconName) =>
        iconName !== "createLucideIcon" &&
        iconName !== "icons" &&
        !iconName.endsWith("Icon")
    )
    .sort((a, b) => (b.startsWith("Circle") || b.endsWith("Circle") ? 1 : -1));
  console.log(filteredIconNames);

  const DisplayIcon = Icons[iconType];

  const searchFilter = useMemo(() => {
    return [...filteredIconNames].filter((icon) =>
      icon.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, filteredIconNames]);

  const pascalToSpaces = (str) => {
    return str.replace(/([A-Z])/g, " $1").trim();
  };

  const onChangeSearchIcon = (e) => {
    setSearch(e.target.value);
  };

  function Cell({ columnIndex, rowIndex, data, style }) {
    const icon = data[rowIndex * 8 + columnIndex]; // Assuming 10 columns
    if (icon !== "Beacon" && !Icons[icon]) {
      console.error(`Icon "${icon}" is not a valid key in Icons`);
      return null;
    }
    const IconComponent = Icons[icon];
    const iconLabel = typeof icon === "string" ? pascalToSpaces(icon) : "";

    // Determine tooltip side and alignment based on cell position
    let alignSide: any = "center";
    let tooltipSide: any = "top";

    if (columnIndex % 8 === 0) {
      alignSide = "start";
    } else if (columnIndex % 8 === 7) {
      alignSide = "end";
    }

    const rowHeight = 80; // Assuming each row is 80px high
    const gridHeight = 400; // Assuming the Grid is 400px high

    if (rowIndex === 0) {
      tooltipSide = "bottom";
    }
    return (
      <div style={style} className="flex items-center justify-center ">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger
              key={icon}
              className="z-1000 rounded-md"
              onClick={() => {
                onChangeIconType(icon);
                setOpenIconPickerDialog(false);
              }}
            >
              <a
                href="#"
                className="block  h-[32px] w-[32px]  rounded-md p-1 transition duration-200 hover:bg-gray-200 dark:hover:bg-accent"
              >
                <IconComponent size={24} />
                <span className="sr-only">{iconLabel}</span>
              </a>
            </TooltipTrigger>

            <TooltipContent
              side={tooltipSide}
              sideOffset={10}
              align={alignSide}
              className="z-1000000"
            >
              <div className="text-xs">{iconLabel}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  return (
    <div>
      <Dialog open={openIconPickerDialog} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button
            className="flex h-[36px] gap-2 border border-input bg-white hover:bg-gray-100 dark:border-gray-700 dark:bg-background dark:hover:bg-muted"
            size="sm"
            variant="outline"
          >
            <DisplayIcon />
            Select Icon
          </Button>
        </DialogTrigger>

        <DialogContent className="  max-w-[380px] border border-accent p-0 pb-0 text-foreground dark:bg-[#191919] sm:max-w-[641px]">
          <div className="w-full  px-4 py-4">
            <Input
              className="mb-2 w-[240px]"
              placeholder="Search Icons"
              value={search}
              onChange={onChangeSearchIcon}
            />
          </div>
          <div className="w-full  border-t pb-0">
            <Grid
              columnCount={8}
              columnWidth={80}
              height={400}
              rowCount={Math.ceil(searchFilter.length / 10)}
              rowHeight={80}
              width={640}
              itemData={searchFilter}
            >
              {Cell}
            </Grid>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
