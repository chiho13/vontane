import { createEditor, Editor, Path, Range, Transforms } from "slate";
import { genNodeId } from "./withID";
import { jsx } from "slate-hyperscript";

const transformListItems = (listItems, listType) => {
  return listItems.map((li) => {
    const children = Array.from(li.childNodes)
      .map((node) => {
        if (node.nodeName === "#text") {
          return { text: node.textContent.trim() };
        } else if (node.nodeName === "A") {
          return {
            id: genNodeId(),
            type: "link",
            text: node.textContent.trim(),
            url: node.getAttribute("href"),
          };
        } else if (node.nodeName === "P") {
          return Array.from(node.childNodes)
            .map((childNode) => {
              if (childNode.nodeType === 3) {
                return { text: childNode.textContent.trim() };
              } else if (
                childNode.nodeName === "B" ||
                childNode.nodeName === "STRONG"
              ) {
                return { text: childNode.textContent.trim(), bold: true };
              }
              return null;
            })
            .filter(Boolean);
        }
        return null;
      })
      .flat() // flatten the array in case of nested elements
      .filter(Boolean);

    if (!children.length) {
      children.push({ text: "" }); // ensure there is always a text node
    }

    return { id: genNodeId(), type: listType, children: children };
  });
};

const ELEMENT_TAGS = {
  A: (el) => ({ type: "link", url: el.getAttribute("href") }),
  BLOCKQUOTE: () => ({ type: "quote" }),
  H1: () => ({ type: "heading-one" }),
  H2: () => ({ type: "heading-two" }),
  H3: () => ({ type: "heading-three" }),
  IMG: (el) => ({ type: "image", url: el.getAttribute("src") }),
  //   LI: () => ({ type: "list-item" }),

  P: () => ({ id: genNodeId(), type: "paragraph" }),
  PRE: () => ({ type: "code" }),
  // add this to ELEMENT_TAGS

  OL: (el) => {
    const listItems = Array.from(el.children);
    return transformListItems(listItems, "numbered-list");
  },

  UL: (el) => {
    const listItems = Array.from(el.children);
    return transformListItems(listItems, "bulleted-list");
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
  //   U: () => ({ underline: true }),
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
  let children = [];

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
  const { insertData, isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.type === "link" ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const html = data.getData("text/html");

    if (html) {
      let nodesToInsert = [];
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const fragment = deserialize(parsed.body);

      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};
