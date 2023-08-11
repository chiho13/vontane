import { MoreHorizontal, Trash2, Copy } from "lucide-react";
// import { isParentTTS, wrapWithTTS } from "./helpers/toggleBlock";
import { cn } from "@/utils/cn";
import { exportToHTML } from "@/utils/htmlSerialiser";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useContext } from "react";
import { EditorContext } from "@/contexts/EditorContext";

export const Export = () => {
  const { editor } = useContext(EditorContext);
  const downloadAsHTML = () => {
    const htmlContent = exportToHTML(editor);

    const fullHTMLContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <title>Slate Document</title>
    </head>

    <style>

    .katex {
        font-size: 22px;
        text-align: center;
        margin-bottom: 10px
    }
    .katex-html {
        display: none;
      }

      .answer-checkbox:checked + .correct-answer,
      .answer-checkbox:checked + .incorrect-answer {
        display: block !important;
      }
      

    </style>
    <body>
    <div class="relative mx-auto mb-20 max-w-[700px] xl:mt-[100px]">
      ${htmlContent}
      </div>
    </body>
    </html>
  `;
    const blob = new Blob([fullHTMLContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "slate-document.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger>
              <Button className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-white p-0 outline-none hover:bg-gray-200 dark:bg-muted dark:hover:bg-accent">
                <MoreHorizontal className="option-menu w-[18px] w-[18px] text-darkergray dark:text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <p className="text-[12px]">Export</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" top-0 w-[200px] border dark:border-accent dark:bg-muted">
        <DropdownMenuItem
          className={`flex w-full items-center rounded-sm px-4 py-2 text-left text-sm text-gray-700 transition duration-200 hover:text-gray-900 focus:outline-none dark:text-foreground `}
          onClick={downloadAsHTML}
        >
          Export as HTML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
