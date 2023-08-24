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
  const font = workspaceData.workspace.font_style;
  const pdfMutation = api.workspace.generatePDF.useMutation();

  const generateHTMLOnePageContent = (editorContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
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

  .plyr--audio .plyr__control:focus-visible, .plyr--audio .plyr__control:hover, .plyr--audio .plyr__control[aria-expanded=true] {
    background: #0E78EF;
  }

  .plyr__control svg {
    fill: #0E78EF;
  }

  .plyr__control:hover svg {
    fill: #f1f1f1;
  }

  .plyr__control:focus-visible svg {
    fill: #f1f1f1;
  }


  .preview-tts p, .preview-tts h1, .preview-tts h2, .preview-tts h3 {
    margin: 0
  }

</style>
<body class="pt-[50px] ">
<div class="relative mx-auto mb-20 max-w-[700px] lg:mt-[70px] ${font}">
<button onclick="window.print()" class="font-sans print-button text-sm fixed top-4 right-4 mb-4 border border-accent bg-white hover:bg-gray-100 text-gray-500 font-bold py-2 px-4 rounded">
Save as PDF
</button>
  ${editorContent}
  </div>
  <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
  <script>
  document.querySelectorAll('audio').forEach(audio => {
    const text = audio.getAttribute('data-text');
    if (text && text.length < 40) {
      const player = new Plyr(audio, {
        controls: ['play'], // Only show the play button
      });
    } else {
      const player = new Plyr(audio); // Show full controls
    }
  });
</script>
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
  <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
  <title>${editor.children[0].children[0].text}</title>
</head>

<style>

body {
  overflow:hidden
}
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
    padding-bottom: 50px'
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
  
  .plyr--audio .plyr__control:focus-visible, .plyr--audio .plyr__control:hover, .plyr--audio .plyr__control[aria-expanded=true] {
    background: #0E78EF;
  }

  .plyr__control svg {
    fill: #0E78EF;
  }

  .plyr__control:hover svg {
    fill: #f1f1f1;
  }

  .plyr__control:focus-visible svg {
    fill: #f1f1f1;
  }

  .preview-tts p, .preview-tts h1, .preview-tts h2, .preview-tts h3 {
    margin: 0
  }


</style>
<body>
<div style="position: sticky; top: 0; z-index: 10; display: flex; gap: 0.75rem; border-bottom: 1px solid #cccccc; background-color: white; padding: 1.25rem; color: #4a5568; box-shadow: 0px 1px 3px 0px #0000001A, 0px 1px 2px 0px #0000000F; text-shadow: 0px 1px 3px 0px #0000001A, 0px 1px 2px 0px #0000000F;">

        <span id="slide-number" class="flex min-w-[50px]">
          </span>

        <span className="font-bold ${font}">
          ${editor.children[0].children[0].text}
        </span>
      </div>
<div class="relative ">

  <div class="slide-container overflow-y-auto pt-[30px] pb-[50px] lg:pt-[70px] ">
  <div class="slide-wrapper relative mx-auto max-w-[700px] ${font}" >

    ${editorContent}
    </div>
  </div>
  <div class="fixed bottom-8 right-8 h-[40px] flex w-[80px] shadow-md">
  <button id="previous "onclick="navigateSlides(-1)" class="cursor-pointer inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none  bg-black text-white hover:bg-gray-800 h-[40px] w-[40px] rounded-none  border-gray-700 p-0 dark:border-gray-200"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 stroke-accent"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
  </button>
  <button id="next" onclick="navigateSlides(1)" class="cursor-pointer inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none  bg-black text-white hover:bg-gray-800  h-[40px] w-[40px] rounded-none  border-gray-700 p-0 border-l">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 stroke-accent"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
  </button>
  </div>
  </div>
  <script src="https://cdn.plyr.io/3.7.8/plyr.js"></script>
  <script>
  document.querySelectorAll('audio').forEach(audio => {
    const text = audio.getAttribute('data-text');
    if (text && text.length < 40) {
      const player = new Plyr(audio, {
        controls: ['play'], // Only show the play button
      });
    } else {
      const player = new Plyr(audio); // Show full controls
    }
  });
</script>
  <script>
  
  let currentSlideIndex = 0;
  const slides = document.querySelectorAll('.slide');
  const slideWrapper = document.querySelector('.slide-wrapper');

  slides[0].classList.add('active');
  document.getElementById('title').display = "none";
  slideWrapper.style.flexBasis = slides.length * 100 + '%';
  document.getElementById('slide-number').textContent = "1 / " +  slides.length;
  document.getElementById('title').style.display = "none";
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
      .join("_")}-one-page.html`;

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
      .join("_")}-slides.html`;

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
          disabled={slides.length === 0}
        >
          Slides
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
