import {
  Editor,
  Transforms,
  Text,
  Range,
  Element as SlateElement,
  BaseElement as SlateBaseElement,
  BaseEditor,
  Path,
  Node,
} from "slate";
import { ReactEditor } from "slate-react";
import { genNodeId } from "@/hoc/withID";
import { CustomElement } from "@/components/DocumentEditor";

const LIST_TYPES = [
  "numbered-list",
  "bulleted-list",
  "checked-list",
  "option-list-item",
];
export interface MyElement extends SlateBaseElement {
  type: string;
}

export const alignMap = {
  start: "left",
  center: "center",
  end: "right",
};

export const isBlockActive = (
  editor: any,
  format: string,
  blockType: any = "type"
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  );

  return !!match;
};

interface CustomNode extends CustomElement {
  align?: string; // This property is optional
}

export const toggleBlock = (editor: any, format: string) => {
  const isActive = isBlockActive(editor, format, "type");
  const isList = LIST_TYPES.includes(format);

  let newProperties: Partial<SlateElement>;

  if (isActive && isList) {
    // If the current block is a list item, turn it into a paragraph
    newProperties = {
      type: "paragraph",
    };
  } else {
    newProperties = {
      type: format,
    };
  }

  if (editor.selection) {
    const [match]: any = Editor.nodes(editor, {
      at: editor.selection,
      match: (n) => SlateElement.isElement(n) && n.type === format,
    });

    // If the selected node doesn't have an 'align' property
    if (match && !match[0].hasOwnProperty("align")) {
      newProperties.align = "start";
    } else if (match && match[0].hasOwnProperty("align")) {
      // Maintain the current alignment if it exists
      newProperties.align = match[0].align;
    }
  }

  Transforms.setNodes<SlateElement>(editor, newProperties);
};

export const isFormatActive = (editor: any, format: string) => {
  let isActive = true;
  for (const [node] of Editor.nodes(editor, {
    match: Text.isText,
    at: editor.selection,
    universal: true,
    voids: false,
  })) {
    if (!node[format]) {
      isActive = false;
      break;
    }
  }

  return isActive;
};

let isToggling = false;

export const toggleFormat = (editor: any, format: string) => {
  if (isToggling) return;

  isToggling = true;

  const isActive = isFormatActive(editor, format);

  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: (n) => Text.isText(n), split: true }
  );

  // Use setTimeout to allow the UI to update before unlocking
  setTimeout(() => {
    isToggling = false;
  }, 0);
};

export const wrapWithTTS = (editor: any, element?: any) => {
  let range;

  if (element) {
    const path = ReactEditor.findPath(editor, element);

    // Else, retain the original logic
    range = Editor.range(editor, path);
  } else {
    const { selection } = editor;
    if (!selection) return;

    const [startPoint, endPoint] = Range.edges(selection);
    const startBlock = Editor.above(editor, {
      match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      at: startPoint.path,
    })!;
    const endBlock = Editor.above(editor, {
      match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      at: endPoint.path,
    })!;

    if (!startBlock || !endBlock) return;

    const blockPathStart = startBlock[1];
    const blockPathEnd = endBlock[1];

    // create a range from start block to end block
    range = Editor.range(editor, blockPathStart, blockPathEnd);
  }

  // wrap all nodes in the created range
  Transforms.wrapNodes(
    editor,
    {
      id: genNodeId(),
      type: "tts",
      voice_id: "022dAxTS7hgOwOZorFb9",
      name: "Arthur",
      accent: "british",
      children: [],
    },
    { at: range }
  );
};

export const wrapElementWithTTS = (editor: any, element: any) => {
  const path = ReactEditor.findPath(editor, element);
  Transforms.wrapNodes(
    editor,
    {
      id: genNodeId(),
      type: "tts",
      voice_id: "022dAxTS7hgOwOZorFb9",
      name: "Arthur",
      accent: "british",
      audioplayer: false,
      children: [],
    },
    { at: path }
  );
};

export const isParentTTS = (editor: Editor) => {
  const { selection } = editor;
  if (!selection) return false;

  const parent = Editor.above(editor, {
    match: (n) =>
      SlateElement.isElement(n) &&
      "type" in n &&
      (n as MyElement).type === "tts",
  });

  return !!parent;
};

export const isParentMCQ = (editor) => {
  const { selection } = editor;
  if (!selection) return false;

  const parent = Editor.above(editor, {
    match: (n) =>
      SlateElement.isElement(n) &&
      "type" in n &&
      (n as MyElement).type === "mcq",
  });
  return !!parent;
};

export const isParentList = (editor: Editor) => {
  const { selection } = editor;
  if (!selection) return false;

  const parent = Editor.above(editor, {
    match: (n) =>
      (SlateElement.isElement(n) &&
        "type" in n &&
        (n as MyElement).type === "checked-list") ||
      (n as MyElement).type === "numbered-list" ||
      (n as MyElement).type === "bulleted-list",
  });

  return !!parent;
};

export function insertNewParagraph(editor: Editor, newPath: Path) {
  const newNode = {
    id: genNodeId(),
    type: "paragraph",
    align: "start",
    children: [{ text: "" }],
  };

  Transforms.insertNodes(editor, newNode, { at: newPath });
  Transforms.select(editor, Editor.start(editor, newPath));
}

interface LinkElement extends SlateElement {
  type: "link";
  url: string;
  children: Node[];
}

export const getActiveLinkUrl = (editor) => {
  let linkUrl = "";
  for (const [node] of Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  })) {
    const linkNode = node as LinkElement;
    if (linkNode.url) {
      linkUrl = linkNode.url;
      break;
    }
  }
  return linkUrl;
};

export const insertInlineBlock = (editor, type) => {
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);

  let selectedText = "";
  const id = genNodeId();
  // Only get the selected text if there's a selection
  if (selection) {
    selectedText = Editor.string(editor, selection); // Get the selected text
  }

  const inlineEq = {
    id,
    type,
    latex: selectedText,
    children: [{ text: "" }],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, inlineEq, {
      at: editor.selection.anchor.path,
    });
  } else {
    Transforms.delete(editor); // Delete selected nodes
    Transforms.insertNodes(editor, inlineEq); // Insert new node
  }

  return { id, latex: selectedText };
};
