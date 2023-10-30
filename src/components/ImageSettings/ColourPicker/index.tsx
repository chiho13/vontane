import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";

export const ColorPicker = ({ color, onChange, label }) => {
  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="gap-2 border border-gray-300  bg-white px-[6px] text-gray-700 dark:border-accent dark:bg-muted  dark:text-gray-200 "
          >
            <span
              className="h-[24px] w-[24px] rounded-md border"
              style={{
                backgroundColor: color,
              }}
            ></span>
            {label} <ChevronDown className="w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={10}
          className=" w-auto border border-gray-300 bg-background  p-2 dark:border-gray-700  dark:bg-muted "
        >
          <HexColorPicker color={color} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
};
