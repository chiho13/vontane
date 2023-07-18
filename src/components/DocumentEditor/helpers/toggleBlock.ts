import {
  Editor,
  Transforms,
  Text,
  Range,
  Element as SlateElement,
  BaseElement as SlateBaseElement,
  BaseEditor,
  Path,
} from "slate";
import { ReactEditor } from "slate-react";
import { genNodeId } from "@/hoc/withID";

const LIST_TYPES = ["numbered-list", "bulleted-list", "checked-list"];
export interface MyElement extends SlateBaseElement {
  type: string;
}

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

export const toggleBlock = (editor: any, format: string) => {
  const isActive = isBlockActive(editor, format, "type");
  const isList = LIST_TYPES.includes(format);

  // Transforms.unwrapNodes(editor, {
  //   match: (n) =>
  //     !Editor.isEditor(n) &&
  //     SlateElement.isElement(n) &&
  //     n.type === "column-cell",
  //   split: true,
  // });

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

  Transforms.setNodes<SlateElement>(editor, newProperties);

  // if (!isActive && isList) {
  //   const block = { type: format, children: [] };
  //   Transforms.wrapNodes(editor, block);
  // }
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

export const toggleFormat = (editor: any, format: string) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: (n) => Text.isText(n), split: true }
  );
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

export function insertNewParagraph(editor: Editor, newPath: Path) {
  const newNode = {
    id: genNodeId(),
    type: "paragraph",
    children: [{ text: "" }],
  };

  Transforms.insertNodes(editor, newNode, { at: newPath });
  Transforms.select(editor, Editor.start(editor, newPath));
}
