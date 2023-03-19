import React, { useCallback, useMemo, useState } from "react";
import { createEditor, Editor, Transforms, Path, BaseEditor } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { Plus } from "lucide-react";

import { useTheme } from "styled-components";

interface DocumentEditorProps {
  handleTextChange?: (value: any) => void;
}

type CustomElement = {
  type: "paragraph";
  children: CustomText[];
};

type CustomText = {
  text: string;
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  handleTextChange,
}) => {
  const theme = useTheme();
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "Type here" }],
    },
  ]);

  function handleAddEquation() {
    console.log("handleAddEquation");
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const { selection } = editor;

      if (selection) {
        const [parentNode, parentPath] = Editor.parent(
          editor,
          selection.anchor.path
        );
        if (parentNode.type === "paragraph") {
          const newPath = Path.next(parentPath);
          Transforms.insertNodes(
            editor,
            {
              type: "paragraph",
              children: [{ text: "" }],
            },
            { at: newPath }
          );
          Transforms.select(editor, Editor.start(editor, newPath));
        }
      }
    }
  };

  const renderElement = useCallback((props) => {
    const { attributes, children, element } = props;

    if (element.type === "paragraph") {
      return (
        <div className="group relative" {...attributes}>
          <p className="pl-6 leading-relaxed">{children}</p>
          <div
            className="absolute -left-4 top-3 -mt-5 flex h-10 w-10 cursor-pointer items-center justify-center opacity-0 group-hover:opacity-100"
            onClick={handleAddEquation}
          >
            <button className="rounded-md hover:bg-gray-200">
              <Plus color={theme.colors.darkgray} />
            </button>
          </div>
        </div>
      );
    }

    return <div {...attributes}>{children}</div>;
  }, []);

  return (
    <div
      tabIndex={0}
      className="mb-2 h-[400px] rounded-md border border-2 border-gray-200 border-gray-100 p-4 shadow-md focus:outline-none focus-visible:border-gray-400"
    >
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          if (handleTextChange) {
            handleTextChange(newValue);
          }
        }}
      >
        <Editable renderElement={renderElement} onKeyDown={handleKeyDown} />
      </Slate>
    </div>
  );
};

export default DocumentEditor;
