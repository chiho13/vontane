import { ChevronDown, ChevronUp } from "lucide-react";
import { Editor, Path, Transforms } from "slate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoveBlockProps {
  editor: Editor;
  path: Path;
}

export const MoveBlock: React.FC<MoveBlockProps> = ({ editor, path }) => {
  const moveBlock = (direction: "up" | "down") => {
    const currentPath = path;
    const previousPath = Path.previous(currentPath);
    const nextPath = Path.next(currentPath);

    let newPath;
    if (direction === "up") {
      newPath = previousPath;
    } else if (direction === "down") {
      newPath = nextPath;
    }

    if (newPath) {
      Transforms.moveNodes(editor, {
        at: currentPath,
        to: newPath,
      });
    }
  };

  const selectedBlockIndex = path[0];
  return (
    <div className="absolute  left-[10px] top-[7px] flex flex-col">
      {selectedBlockIndex && selectedBlockIndex > 1 && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>
              <button
                className="addButton flex h-[22px] w-[22px] items-center justify-center rounded-md ease-in-out hover:bg-gray-200 dark:hover:bg-accent"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  moveBlock("up");
                }}
              >
                <ChevronUp
                  className="stroke-muted-foreground dark:stroke-muted-foreground"
                  width={20}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={10}>
              <p className="text-[12px]">Move up</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {selectedBlockIndex &&
        selectedBlockIndex < editor.children.length - 1 && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <button
                  className="addButton flex h-[22px] w-[22px] items-center justify-center rounded-md ease-in-out hover:bg-gray-300 dark:hover:bg-accent"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    moveBlock("down");
                  }}
                >
                  <ChevronDown
                    className="stroke-muted-foreground  dark:stroke-muted-foreground"
                    width={20}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10}>
                <p className="text-[12px]">Move down</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
    </div>
  );
};
