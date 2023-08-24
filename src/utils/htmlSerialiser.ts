import { alignMap } from "@/components/DocumentEditor/helpers/toggleBlock";
import { genNodeId } from "@/hoc/withID";
import { Editor, Element as SlateElement } from "slate";
import katex from "katex";
import { useTheme } from "next-themes";
import { splitIntoSlides } from "./renderHelpers";

export const slateNodeToHtml = (node) => {
  if (SlateElement.isElement(node)) {
    const childrenHtml = node.children.map(slateNodeToHtml).join("");
    switch (node.type) {
      case "paragraph":
        return `<p data-align="text-${
          alignMap[node.align] || node.align
        }">${childrenHtml}</p>`;

      case "link":
        return `<a class="text-brand underline dark:text-blue-400" href="${node.url}" target="_blank">${childrenHtml}</a>`;
      case "heading-one":
        return `<h1 class="text-4xl" data-align="text-${
          alignMap[node.align] || node.align
        }">${childrenHtml}</h1>`;
      case "heading-two":
        return `<h2 class="text-3xl" data-align="text-${
          alignMap[node.align] || node.align
        }">${childrenHtml}</h2>`;

      case "heading-three":
        return `<h3 class="text-2xl" data-align="text-${
          alignMap[node.align] || node.align
        }">${childrenHtml}</h3>`;

      case "numbered-list":
        return childrenHtml;
      case "bulleted-list":
        return childrenHtml;
      case "checked-list":
        return `<label data-align="text-${
          alignMap[node.align] || node.align
        }" class="flex items-center gap-3 mt-2"><input class="w-[18px] h-[18px]" type="checkbox" name="option1" value="Option1" ${
          node.checked ? "checked" : ""
        } />${childrenHtml}</label>`;

      case "option-list-item":
        return childrenHtml;

      case "block-quote":
        return `<blockquote class="items-center border-l-4 border-gray-400 bg-white pl-3  text-gray-500 dark:bg-muted dark:text-gray-200">${childrenHtml}</blockquote>`;
      case "equation":
        return `<div data-type="equation" data-latex="${node.latex}"></div>`;

      case "inline-equation":
        return `<div data-type="inline-equation" data-latex="${node.latex}"></div>`;
      default:
        return childrenHtml;
    }
  } else {
    // Text node
    let textHtml = node.text;
    if (node.bold) {
      textHtml = `<strong>${textHtml}</strong>`;
    }
    if (node.italic) {
      textHtml = `<em>${textHtml}</em>`;
    }
    if (node.underline) {
      textHtml = `<u>${textHtml}</u>`;
    }
    if (node.strikethrough) {
      textHtml = `<del>${textHtml}</del>`;
    }
    // ... handle other marks ...
    return textHtml;
  }
};

export const getHtmlFromSelection = (editor) => {
  if (!editor.selection) return "";

  // Get the fragment (block of text) from the current selection
  const fragment = Editor.fragment(editor, editor.selection);

  let inNumberedList = false;
  let inBulletedList = false;
  let numberedListItems = "";
  let bulletedListItems = "";

  let quizOptions = "";
  let inQuiz = false;
  let optionCounter = 0;

  let optionCounterCounts = {};
  const indexToAlpha = (index) => String.fromCharCode(65 + index);

  // Convert each node in the fragment to HTML
  const htmlParts = fragment.map((node, i) => {
    let html = slateNodeToHtml(node);

    let uniqueInputId;

    if (SlateElement.isElement(node) && node.type === "numbered-list") {
      numberedListItems += `<li class="list-decimal pl-2">${html}</li>`;
      const nextNode = fragment[i + 1];

      // If it's the last node or the next node is not a numbered-list
      if (
        i === fragment.length - 1 ||
        (SlateElement.isElement(nextNode) && nextNode.type !== "numbered-list")
      ) {
        inNumberedList = false;
        let olHtml = `<ol data-align="text-${
          alignMap[node.align] || node.align
        }" class="pl-5 mt-2">${numberedListItems}</ol>`;
        numberedListItems = "";
        return olHtml;
      } else {
        inNumberedList = true;
        return null; // Do not add this node to htmlParts yet
      }
    } else if (SlateElement.isElement(node) && node.type === "bulleted-list") {
      bulletedListItems += `<li class="list-disc pl-2">${html}</li>`;
      const nextNode = fragment[i + 1];

      // If it's the last node or the next node is not a bulleted-list
      if (
        i === fragment.length - 1 ||
        (SlateElement.isElement(nextNode) && nextNode.type !== "bulleted-list")
      ) {
        inBulletedList = false;
        let ulHtml = `<ul data-align="text-${
          alignMap[node.align] || node.align
        }" class="pl-5 mt-2">${bulletedListItems}</ul>`;
        bulletedListItems = "";
        return ulHtml;
      } else {
        inBulletedList = true;
        return null; // Do not add this node to htmlParts yet
      }
    } else if (
      SlateElement.isElement(node) &&
      node.type === "option-list-item"
    ) {
      uniqueInputId = genNodeId();
      // Add alpha numbering to the option
      const alpha = indexToAlpha(optionCounterCounts[optionCounter] || 0);
      quizOptions += `<li class="pl-2 " style="list-style-type: upper-alpha;">
      ${html}
   
    </li>
    `;

      // Increment the count for this optionCounter
      optionCounterCounts[optionCounter] =
        (optionCounterCounts[optionCounter] || 0) + 1;

      const nextNode = fragment[i + 1];

      // If it's the last node or the next node is not a numbered-list
      if (
        i === fragment.length - 1 ||
        (SlateElement.isElement(nextNode) &&
          nextNode.type !== "option-list-item")
      ) {
        inQuiz = false;
        let olHtml = `<ol data-type="quiz" class="mb-8 pl-5">${quizOptions}</ol>`;
        optionCounter++;
        quizOptions = "";
        return olHtml;
      } else {
        inQuiz = true;
        return null; // Do not add this node to htmlParts yet
      }
    } else {
      if (SlateElement.isElement(node) && inNumberedList) {
        inNumberedList = false;
        let olHtml = `<ol data-align="text-${
          alignMap[node.align] || node.align
        }" class="pl-5 mt-2">${numberedListItems}</ol>`;
        numberedListItems = "";
        return olHtml + html;
      } else if (SlateElement.isElement(node) && inBulletedList) {
        inBulletedList = false;
        let ulHtml = `<ul  data-align="text-${
          alignMap[node.align] || node.align
        }" class="pl-5 mt-2">${bulletedListItems}</ul>`;
        bulletedListItems = "";
        return ulHtml + html;
      } else if (SlateElement.isElement(node) && inQuiz) {
        inQuiz = false;
        let divHtml = `<ol data-type="quiz">${quizOptions}</ol>`;
        quizOptions = "";
        optionCounter = 0; // Reset the counter
        return divHtml + html;
      } else {
        return html;
      }
    }
  });

  return htmlParts.filter((part) => part !== null).join("");
};

export const exportSlateNodeToHtml = (node) => {
  const MAPTILER_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (SlateElement.isElement(node)) {
    const childrenHtml = node.children.map(exportSlateNodeToHtml).join("");
    switch (node.type) {
      case "title":
        return `<h1 class="mb-4 text-4xl font-bold" id="title">
                ${childrenHtml}
          </h1>`;
      case "paragraph":
        if (childrenHtml === "") {
          return `<p class="mt-2"> </p>`;
        } else {
          return `<p class="mt-2 text-${
            alignMap[node.align] || node.align
          }">${childrenHtml}</p>`;
        }

      case "link":
        return `<a class="text-brand underline dark:text-blue-400" href="${node.url}" target="_blank">${childrenHtml}</a>`;
      case "heading-one":
        return `<h1 class="mt-4 mb-10  text-4xl lg:text-5xl font-bold text-${
          alignMap[node.align] || node.align
        }">${childrenHtml}</h1>`;
      case "heading-two":
        return `<h2 class="mt-4 mb-4 text-2xl lg:text-3xl  font-bold text-${
          alignMap[node.align] || node.align
        }">${childrenHtml}</h2>`;

      case "heading-three":
        return `<h3 class=" mt-4 mb-4  text-xl lg:text-2xl font-bold text-${
          alignMap[node.align] || node.align
        }" >${childrenHtml}</h3>`;

      case "numbered-list":
        return childrenHtml;
      case "bulleted-list":
        return childrenHtml;
      case "checked-list":
        return `<label class="flex items-center gap-3 mt-2"><input class="w-[18px] h-[18px]" type="checkbox" name="option1" value="Option1" ${
          node.checked ? "checked" : ""
        } />${childrenHtml}</label>`;

      case "option-list-item":
        return childrenHtml;

      case "block-quote":
        return `<blockquote class="text-${
          alignMap[node.align] || node.align
        } border-l-4 border-gray-500 bg-white pl-3  text-gray-500">${childrenHtml}</blockquote>`;
      case "equation":
        const renderedEquation = katex.renderToString(
          `\\displaystyle ${node.latex}`
        );
        return `<div class="katex block text-sm mt-6 mb-6">${renderedEquation}</div>`;

      case "inline-equation":
        const renderedInlineEquation = katex.renderToString(
          `\\displaystyle ${node.latex}`
        );
        return `<span class="katex inline text-sm ">${renderedInlineEquation}</span>`;

      case "image":
        return `<div class="flex mt-3 mb-3  w-full justify-${node.align}"><img src="${node.url}" width="${node.width}" class="rounded-md " /></div>`;
      // case "map":
      //   return `<iframe width="${node.width}" height="${node.height}" src="https://api.maptiler.com/maps/streets/?key=${MAPTILER_ACCESS_TOKEN}#${node.zoom}/${node.latLng[0]}/${node.latLng[1]}" frameborder="0" allowfullscreen></iframe>`;

      case "map":
        return `<img width="${node.width}" height="${
          node.height
        }" src="https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/pin-m-marker+285A98(${
          node.latLng[1]
        },${node.latLng[0]})/${node.latLng[1]},${node.latLng[0]},${
          node.zoom
        },0,0/${Math.round(node.width)}x${Math.round(
          node.height
        )}@2x?attribution=true&logo=true&access_token=pk.eyJ1IjoiYW50aG9ueWhvZGVzdSIsImEiOiJjanI2aWdmMmYxNXB2NDN0ZzJnd3FsMHg3In0.SejE2ZJApZ0Rg5UTsK7kPw" alt="Mapbox map" />`;

      case "tts":
        const ttsChildrenHtml = node.children
          .map(exportSlateNodeToHtml)
          .join("");
        return `
            <div class=" preview-tts mt-4 mb-4 ${
              node.children[0].children[0].text.length < 40
                ? `flex  gap-[10px] justify-${node.children[0].align}`
                : ""
            }">
            <div class="${
              node.children[0].children[0].text.length < 40
                ? "w-[50px] overflow-hidden flex  items-center"
                : ""
            }">

              <audio controls data-text="${node.children[0].children[0].text}">
                <source src="${node.audio_url}" type="audio/mpeg">
                Your browser does not support the audio element.
              </audio>
            </div>
              ${!node.audioplayer ? ttsChildrenHtml : ""}
            </div>
          `;

      case "column":
        const columnElements = node.children
          .map(exportSlateNodeToHtml)
          .join("");
        return `
            <div class="grid grid-cols-2 gap-4 mb-4">

            ${columnElements}
            </div>
          `;

      default:
        return childrenHtml;
    }
  } else {
    // Text node
    let textHtml = node.text;
    if (node.bold) {
      textHtml = `<strong>${textHtml}</strong>`;
    }
    if (node.italic) {
      textHtml = `<em>${textHtml}</em>`;
    }
    if (node.underline) {
      textHtml = `<u>${textHtml}</u>`;
    }
    if (node.strikethrough) {
      textHtml = `<del>${textHtml}</del>`;
    }
    // ... handle other marks ...
    return textHtml;
  }
};

export const exportToHTML = (editor, view = "one-page") => {
  // Get the fragment (block of text) from the current selection
  // const fragment = editor.children;
  const slides =
    view === "slides" ? splitIntoSlides(editor.children) : [editor.children];
  let inNumberedList = false;
  let inBulletedList = false;
  let numberedListItems = "";
  let bulletedListItems = "";

  let quizOptions = "";
  let inQuiz = false;
  let optionCounter = 0;

  let optionCounterCounts = {};
  const indexToAlpha = (index) => String.fromCharCode(65 + index);

  // Convert each node in the fragment to HTML

  const htmlSlides = slides.map((slide, slideNumber) => {
    const fragment = slide;

    const htmlParts = fragment.map((node, i) => {
      let html = exportSlateNodeToHtml(node);

      let uniqueInputId;

      if (SlateElement.isElement(node) && node.type === "numbered-list") {
        numberedListItems += `<li class="list-decimal pl-2">${html}</li>`;
        const nextNode = fragment[i + 1];

        // If it's the last node or the next node is not a numbered-list
        if (
          i === fragment.length - 1 ||
          (SlateElement.isElement(nextNode) &&
            nextNode.type !== "numbered-list")
        ) {
          inNumberedList = false;
          let olHtml = `<ol data-align="text-${
            alignMap[node.align] || node.align
          }" class="pl-5 mt-2">${numberedListItems}</ol>`;
          numberedListItems = "";
          return olHtml;
        } else {
          inNumberedList = true;
          return null; // Do not add this node to htmlParts yet
        }
      } else if (
        SlateElement.isElement(node) &&
        node.type === "bulleted-list"
      ) {
        bulletedListItems += `<li class="list-disc pl-2">${html}</li>`;
        const nextNode = fragment[i + 1];

        // If it's the last node or the next node is not a bulleted-list
        if (
          i === fragment.length - 1 ||
          (SlateElement.isElement(nextNode) &&
            nextNode.type !== "bulleted-list")
        ) {
          inBulletedList = false;
          let ulHtml = `<ul data-align="text-${
            alignMap[node.align] || node.align
          }" class="pl-5 mt-2">${bulletedListItems}</ul>`;
          bulletedListItems = "";
          return ulHtml;
        } else {
          inBulletedList = true;
          return null; // Do not add this node to htmlParts yet
        }
      } else if (
        SlateElement.isElement(node) &&
        node.type === "option-list-item"
      ) {
        uniqueInputId = genNodeId();
        // Add alpha numbering to the option
        const alpha = indexToAlpha(optionCounterCounts[optionCounter] || 0);
        let correctAnswerClass = node.correctAnswer
          ? `<span class="correct-answer hidden absolute right-[44px] text-green-500">Correct</span>`
          : `<span class="incorrect-answer hidden absolute right-[44px] text-red-500">Incorrect</span>`;

        quizOptions += `<li class="pl-2 list-none relative max-w-[420px]">
    <label class="flex mt-2 h-[40px] w-full  cursor-pointer items-center gap-3 rounded-md border border-gray-400 p-2 px-1 hover:border-gray-500 dark:border-gray-700">
      <div class="flex h-[28px] w-[28px] ml-px items-center justify-center rounded-md">${alpha}.</div>
      <div class="w-full flex justify-between">
        ${html}
        <input class="flex h-[24px] w-[24px] justify-end mr-1 answer-checkbox" type="radio" name="quizOption-${optionCounter}" value="Option1" />
        ${correctAnswerClass}
        </div>
    
    </label>
  </li>`;

        // Increment the count for this optionCounter
        optionCounterCounts[optionCounter] =
          (optionCounterCounts[optionCounter] || 0) + 1;

        const nextNode = fragment[i + 1];

        // If it's the last node or the next node is not a numbered-list
        if (
          i === fragment.length - 1 ||
          (SlateElement.isElement(nextNode) &&
            nextNode.type !== "option-list-item")
        ) {
          inQuiz = false;
          let olHtml = `<ol data-type="quiz" class="mb-8">${quizOptions}</ol>`;
          optionCounter++;
          quizOptions = "";
          return olHtml;
        } else {
          inQuiz = true;
          return null; // Do not add this node to htmlParts yet
        }
      } else {
        if (SlateElement.isElement(node) && inNumberedList) {
          inNumberedList = false;
          let olHtml = `<ol data-align="text-${
            alignMap[node.align] || node.align
          }" class="pl-5 mt-2">${numberedListItems}</ol>`;
          numberedListItems = "";
          return olHtml + html;
        } else if (SlateElement.isElement(node) && inBulletedList) {
          inBulletedList = false;
          let ulHtml = `<ul  data-align="text-${
            alignMap[node.align] || node.align
          }" class="pl-5 mt-2">${bulletedListItems}</ul>`;
          bulletedListItems = "";
          return ulHtml + html;
        } else if (SlateElement.isElement(node) && inQuiz) {
          inQuiz = false;
          let divHtml = `<ol data-type="quiz" type="A">${quizOptions}</ol>`;
          quizOptions = "";
          optionCounter = 0; // Reset the counter
          return divHtml + html;
        } else {
          return html;
        }
      }
    });

    return view === "slides"
      ? `<div class="slide" data-slide="${slideNumber + 1}">${htmlParts
          .filter((part) => part !== null)
          .join("")}</div>`
      : htmlParts.filter((part) => part !== null).join("");
  });

  return htmlSlides.join("");
};
