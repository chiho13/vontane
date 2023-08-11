import { MoreHorizontal, Trash2, Copy, ChevronRight } from "lucide-react";
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
import { useWorkspaceTitleUpdate } from "@/contexts/WorkspaceTitleContext";
import { useRouter } from "next/router";

export const Export = () => {
  const { editor } = useContext(EditorContext);
  const router = useRouter();
  const workspaceId = router.query.workspaceId as string;
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
    a.download = `${editor.children[0].children[0].text
      .toLowerCase()
      .replace(/-/g, "_") // Add this line to remove dashes
      .split(" ")
      .join("_")}.html`;

    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button className="border" variant="outline" size="xs">
          Export <ChevronRight className="w-4" />
        </Button>
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
