import {
  MoreHorizontal,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
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
import { api } from "@/utils/api";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { splitIntoSlides } from "@/utils/renderHelpers";

export const Export = () => {
  const { editor } = useContext(EditorContext);
  const router = useRouter();
  const { workspaceData } = useTextSpeech();

  const slides = splitIntoSlides(editor.children);
  const workspaceId = router.query.workspaceId as string;

  const pdfMutation = api.workspace.generatePDF.useMutation();

  const generateHTMLOnePageContent = (editorContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>${editor.children[0].children[0].text}</title>
</head>

<style>

.katex {
    font-size: 20px;
    text-align: center;
}

.katex-html {
    display: none;
  }

  .answer-checkbox:checked + .correct-answer,
  .answer-checkbox:checked + .incorrect-answer {
    display: block !important;
  }

  @media print {
    .print-button {
      display: none;
    }
  }

</style>
<body class="pt-[50px]">
<div class="relative mx-auto mb-20 max-w-[700px] lg:mt-[70px]">
<button onclick="window.print()" class="print-button text-sm fixed top-4 right-4 mb-4 border border-accent bg-white hover:bg-gray-100 text-gray-500 font-bold py-2 px-4 rounded">
Save as PDF
</button>
  ${editorContent}
  </div>
  
</body>
</html>
`;

  const generateHTMLSlidesContent = (editorContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <title>${editor.children[0].children[0].text}</title>
</head>

<style>

.katex {
    font-size: 20px;
    text-align: center;
}

.katex-html {
    display: none;
  }

  .answer-checkbox:checked + .correct-answer,
  .answer-checkbox:checked + .incorrect-answer {
    display: block !important;
  }

  @media print {
    .print-button {
      display: none;
    }
  }

  .slide-container {
    position: relative;
    overflow-x: hidden;
    height: calc(100vh - 65px);
  }

  .slide-wrapper {
    display: flex;
    transition: transform 300ms ease;
  }
  
  .slide {
    width: 100%;
    flex-shrink: 0;
    transition: visibility 0s 300ms, opacity 300ms ease-in-out;
    opacity: 0;
    visibility: hidden; 
  }
  
  .slide.active {
    opacity: 1;
    visibility: visible; 
    transition: opacity 300ms ease-in-out;
  }
  
  
  

</style>
<body>
<div style="position: sticky; top: 0; z-index: 10; display: flex; gap: 0.75rem; border-bottom: 1px solid #cccccc; background-color: white; padding: 1.25rem; color: #4a5568; box-shadow: 0px 1px 3px 0px #0000001A, 0px 1px 2px 0px #0000000F; text-shadow: 0px 1px 3px 0px #0000001A, 0px 1px 2px 0px #0000000F;">

        <span id="slide-number">
          </span>

        <span className="font-bold ${workspaceData.workspace.font_style}">
          ${editor.children[0].children[0].text}
        </span>
      </div>
<div class="relative lg:mt-[70px]">

  <div class="slide-container overflow-y-auto ">
  <div class="slide-wrapper relative mx-auto max-w-[700px]" >

    ${editorContent}
    </div>
  </div>
  <div class="fixed bottom-8 right-8 h-[40px] shadow-md">
  <button id="previous "onclick="navigateSlides(-1)" class="cursor-pointer inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none  bg-black text-white hover:bg-gray-800 h-[40px] w-[40px] rounded-none border border-r-0 border-gray-700 p-0 dark:border-gray-200"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 stroke-accent"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
  </button>
  <button id="next" onclick="navigateSlides(1)" class="cursor-pointer inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none  bg-black text-white hover:bg-gray-800  h-[40px] w-[40px] rounded-none border border-gray-700 p-0 disabled:border-l-0 border-l-0 dark:border-gray-200">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 stroke-accent"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
  </button>
  </div>
  </div>

  <script>
  let currentSlideIndex = 0;
  const slides = document.querySelectorAll('.slide');
  const slideWrapper = document.querySelector('.slide-wrapper');

  slides[0].classList.add('active');
  slideWrapper.style.flexBasis = slides.length * 100 + '%';
  document.getElementById('slide-number').textContent = "1 / " +  slides.length;

  function navigateSlides(step) {
    slides[currentSlideIndex].classList.remove('active');
    currentSlideIndex += step;
    currentSlideIndex = Math.max(0, Math.min(currentSlideIndex, slides.length - 1));
  
    slides[currentSlideIndex].classList.add('active');
  
    const slideTranslateValue = -currentSlideIndex * 100; 
  
    slideWrapper.style.transform = 'translateX(' + slideTranslateValue + '%)';
    document.getElementById('slide-number').textContent = (currentSlideIndex + 1) + " / " + slides.length;
  }

  window.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      navigateSlides(1);
    } else if (e.key === "ArrowLeft") {
      navigateSlides(-1);
    }
  });
</script>
</body>
</html>
`;
  const downloadAsHTMLOnePage = () => {
    const htmlContent = exportToHTML(editor);

    const fullHTMLContent = generateHTMLOnePageContent(htmlContent);

    const blob = new Blob([fullHTMLContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editor.children[0].children[0].text
      .toLowerCase()
      .replace(/-/g, "_")
      .split(" ")
      .join("_")}.html`;

    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAsHTMLSlides = () => {
    const htmlContent = exportToHTML(editor, "slides");

    const fullHTMLContent = generateHTMLSlidesContent(htmlContent);

    const blob = new Blob([fullHTMLContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${editor.children[0].children[0].text
      .toLowerCase()
      .replace(/-/g, "_")
      .split(" ")
      .join("_")}.html`;

    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-md outline-none ring-brand focus:ring-2">
        <Button className="border outline-none" variant="outline" size="xs">
          Export HTML <ChevronDown className="w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" top-0 w-[200px] border dark:border-accent dark:bg-input">
        <DropdownMenuItem
          className={`flex w-full items-center rounded-sm px-4 py-2 text-left text-sm text-gray-700 transition duration-200 hover:text-gray-900 focus:outline-none dark:text-foreground `}
          onClick={downloadAsHTMLOnePage}
        >
          One Page
        </DropdownMenuItem>
        <DropdownMenuItem
          className={`flex w-full items-center rounded-sm px-4 py-2 text-left text-sm text-gray-700 transition duration-200 hover:text-gray-900 focus:outline-none dark:text-foreground `}
          onClick={downloadAsHTMLSlides}
        >
          Slides
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
