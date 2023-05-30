import {
  Editor,
  Transforms,
  Text,
  Range,
  Element as SlateElement,
  BaseEditor,
} from "slate";
import { ReactEditor } from "slate-react";
import { genNodeId } from "@/hoc/withID";

const LIST_TYPES = ["numbered-list", "bulleted-list", "checked-list"];

export const isBlockActive = (
  editor: BaseEditor & ReactEditor,
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

export const toggleBlock = (
  editor: BaseEditor & ReactEditor,
  format: string
) => {
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

export const isFormatActive = (
  editor: BaseEditor & ReactEditor,
  format: string
) => {
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

export const toggleFormat = (
  editor: BaseEditor & ReactEditor,
  format: string
) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: (n) => Text.isText(n), split: true }
  );
};

export const wrapWithTTS = (
  editor: BaseEditor & ReactEditor,
  element?: any
) => {
  let range;

  if (element) {
    const path = ReactEditor.findPath(editor, element);
    if (element.type === "mcq") {
      // Wrap the "tts" element around the entire mcq element
      Transforms.wrapNodes(
        editor,
        {
          id: genNodeId(),
          type: "tts",
          voice_id: "022dAxTS7hgOZorFb9",
          name: "Arthur",
          children: [],
        },
        { at: path }
      );
    } else {
      // Else, retain the original logic
      range = Editor.range(editor, path);
    }
  } else {
    const { selection } = editor;
    if (!selection) return;

    const [startPoint, endPoint] = Range.edges(selection);
    const startBlock = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
      at: startPoint.path,
    })!;
    const endBlock = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
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
      children: [],
    },
    { at: range }
  );
};

export const isParentTTS = (editor) => {
  const { selection } = editor;
  if (!selection) return false;

  const parent = Editor.above(editor, {
    match: (n) => n.type === "tts",
  });

  return !!parent;
};
