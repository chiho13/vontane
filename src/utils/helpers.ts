import { alignMap } from "@/components/DocumentEditor/helpers/toggleBlock";
import { Editor, Element as SlateElement } from "slate";

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    "http://localhost:3000/";
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to including trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

export const hasSlideElement = (nodes: any[]) => {
  return nodes.some((node) => node.type === "slide");
};

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export async function urlToBlob(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response);
      }
    };
    xhr.onerror = (err) => reject(err);
    xhr.send();
  });
}

export function compareTwoStrings(first, second) {
  first = first.replace(/\s+/g, "");
  second = second.replace(/\s+/g, "");

  if (first === second) return 1; // identical or empty
  if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

  let firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;

    firstBigrams.set(bigram, count);
  }

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

export const slateNodeToHtml = (node) => {
  if (SlateElement.isElement(node)) {
    const childrenHtml = node.children.map(slateNodeToHtml).join("");
    switch (node.type) {
      case "paragraph":
        return `<p class="text-${
          alignMap[node.align] || node.align
        }">${childrenHtml}</p>`;

      case "link":
        return `<a class="text-brand underline dark:text-blue-400" href="${node.url}">${childrenHtml}</a>`;
      case "heading-one":
        return `<h1 class="text-4xl">${childrenHtml}</h1>`;
      case "heading-two":
        return `<h2 class="text-3xl">${childrenHtml}</h2>`;

      case "heading-three":
        return `<h3 class="text-3xl">${childrenHtml}</h3>`;

      case "numbered-list":
        return childrenHtml;
      case "bulleted-list":
        return childrenHtml;
      case "checked-list":
        return `<label class="flex items-center gap-3 mt-2"><input class="w-[18px] h-[18px]" type="checkbox" name="option1" value="Option1" ${
          node.checked ? "checked" : ""
        } /> ${childrenHtml}</label>`;

      case "block-quote":
        return `<blockquote class="items-center border-l-4 border-gray-400 bg-white pl-3  text-gray-500 dark:bg-muted dark:text-gray-300">${childrenHtml}</blockquote>`;
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

  // Convert each node in the fragment to HTML
  const htmlParts = fragment.map((node, i) => {
    let html = slateNodeToHtml(node);

    if (SlateElement.isElement(node) && node.type === "numbered-list") {
      numberedListItems += `<li class="list-decimal pl-2">${html}</li>`;
      const nextNode = fragment[i + 1];

      // If it's the last node or the next node is not a numbered-list
      if (
        i === fragment.length - 1 ||
        (SlateElement.isElement(nextNode) && nextNode.type !== "numbered-list")
      ) {
        inNumberedList = false;
        let olHtml = `<ol class="pl-5 mt-2">${numberedListItems}</ol>`;
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
        let ulHtml = `<ul class="pl-5 mt-2">${bulletedListItems}</ul>`;
        bulletedListItems = "";
        return ulHtml;
      } else {
        inBulletedList = true;
        return null; // Do not add this node to htmlParts yet
      }
    } else {
      if (inNumberedList) {
        inNumberedList = false;
        let olHtml = `<ol class="pl-5 mt-2">${numberedListItems}</ol>`;
        numberedListItems = "";
        return olHtml + html;
      } else if (inBulletedList) {
        inBulletedList = false;
        let ulHtml = `<ul class="pl-5 mt-2">${bulletedListItems}</ul>`;
        bulletedListItems = "";
        return ulHtml + html;
      } else {
        return html;
      }
    }
  });

  return htmlParts.filter((part) => part !== null).join("");
};
