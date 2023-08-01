import { createEditor, Editor, Path, Range, Transforms } from "slate";
import { genNodeId } from "./withID";
import { jsx } from "slate-hyperscript";
import { Element as SlateElement } from "slate";
import { getHtmlFromSelection } from "@/utils/htmlSerialiser";

const transformListItems = (listItems, listType, alignment) => {
  return listItems.map((li: Node) => {
    const children = Array.from(li.childNodes)
      .map((node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          // Check if node is a text node
          const textNode: any = node;
          return { text: textNode.textContent.trim() };
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if node is an element
          const element: any = node;
          if (element.tagName === "A") {
            return {
              id: genNodeId(),
              type: "link",
              text: element.textContent.trim(),
              url: element.getAttribute("href"),
            };
          } else if (element.tagName === "P") {
            return Array.from(element.childNodes)
              .map((childNode: any) => {
                if (childNode.nodeType === Node.TEXT_NODE) {
                  const textChild = childNode;
                  return { text: textChild.textContent.trim() };
                } else if (childNode.nodeType === Node.ELEMENT_NODE) {
                  const childElement = childNode;
                  if (
                    childElement.tagName === "B" ||
                    childElement.tagName === "STRONG"
                  ) {
                    return {
                      text: childElement.textContent.trim(),
                      bold: true,
                    };
                  }
                }
                return null;
              })
              .filter(Boolean);
          }
        }
        return null;
      })
      .flat()
      .filter(Boolean);

    if (!children.length) {
      children.push({ text: "" });
    }

    return {
      id: genNodeId(),
      type: listType,
      align: alignment,
      children: children,
    };
  });
};

const getAlignment = (el) => {
  let alignment = "start";
  const classAttr = el.getAttribute("data-align");

  if (classAttr) {
    switch (classAttr) {
      case "text-left":
        alignment = "start";
        break;
      case "text-center":
        alignment = "center";
        break;
      case "text-right":
        alignment = "end";
        break;
      // handle more cases if needed
    }
  }

  return alignment;
};

const ELEMENT_TAGS = {
  A: (el) => ({ id: genNodeId(), type: "link", url: el.getAttribute("href") }),
  BLOCKQUOTE: () => ({ type: "block-quote" }),
  IMG: (el) => ({ type: "image", url: el.getAttribute("src") }),
  //   LI: () => ({ type: "list-item" }),

  H1: (el) => {
    const alignment = getAlignment(el); // default alignment
    return { id: genNodeId(), type: "heading-one", align: alignment };
  },
  H2: (el) => {
    const alignment = getAlignment(el); // default alignment
    return { id: genNodeId(), type: "heading-two", align: alignment };
  },
  H3: (el) => {
    const alignment = getAlignment(el); // default alignment
    return { id: genNodeId(), type: "heading-three", align: alignment };
  },
  P: (el) => {
    const alignment = getAlignment(el); // default alignment
    return { id: genNodeId(), type: "paragraph", align: alignment };
  },
  LABEL: (el) => {
    const alignment = getAlignment(el);
    const input = el.querySelector('input[type="checkbox"]');
    if (input) {
      return {
        id: genNodeId(),
        type: "checked-list",
        align: alignment,
        checked: input.checked,
      };
    }
    // Return null or some other default for labels that don't contain a checkbox.
    return null;
  },
  PRE: () => ({ type: "code" }),
  // add this to ELEMENT_TAGS

  OL: (el) => {
    const alignment = getAlignment(el);
    const listItems = Array.from(el.children);
    return transformListItems(listItems, "numbered-list", alignment);
  },

  UL: (el) => {
    const alignment = getAlignment(el);
    const listItems = Array.from(el.children);
    return transformListItems(listItems, "bulleted-list", alignment);
  },
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  B: () => ({ bold: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

export const deserialize = (el) => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return "\n";
  }

  const { nodeName } = el;
  let parent = el;

  if (
    nodeName === "PRE" &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === "CODE"
  ) {
    parent = el.childNodes[0];
  }
  let children: any = [];

  if (nodeName !== "UL" && nodeName !== "OL") {
    children = Array.from(parent.childNodes).map(deserialize).flat();
  }

  if (children.length === 0) {
    children = [{ text: "" }];
  }

  if (el.nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    if (Array.isArray(attrs)) {
      return attrs;
    }

    return jsx("element", attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map((child) => jsx("text", attrs, child));
  }

  return children;
};

export const withNormalizePasting = (editor) => {
  const { insertData, isInline, isVoid, copy, getFragment } = editor;

  editor.isInline = (element) => {
    return element.type === "link" ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const html = data.getData("text/html");
    console.log("html", html);

    if (html) {
      let nodesToInsert = [];
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const fragment = deserialize(parsed.body);

      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  editor.getFragment = async () => {
    if (editor.selection) {
      // If there is a selection, get the nodes within the selection.

      // Serialize the nodes to HTML and copy the HTML to the clipboard.
      const html = getHtmlFromSelection(editor); // Implement serialize function based on your requirements
      const item = new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
      });

      try {
        await navigator.clipboard.write([item]);
        console.log("Copied to clipboard successfully!");
      } catch (err) {
        console.error("Failed to write to clipboard: ", err);
      }
    }
  };

  return editor;
};
