import React, {
  useEffect,
  useCallback,
  useMemo,
  useState,
  useRef,
} from "react";
import { createEditor, Editor, Transforms, Path, BaseEditor } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { Plus } from "lucide-react";

import { useTheme } from "styled-components";
import useClickOutside from "@/hooks/useClickOutside";

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

interface MiniDropdownProps {
  innerRef?: React.Ref<HTMLDivElement>;
}

const MiniDropdown = React.forwardRef<HTMLDivElement, MiniDropdownProps>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        className="rounded-md border border-gray-200 bg-white p-2 shadow-md"
      >
        <input />
      </div>
    );
  }
);

MiniDropdown.displayName = "MiniDropdown";

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  handleTextChange,
}) => {
  const theme = useTheme();
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ]);

  const [showDropdown, setShowDropdown] = useState(false);

  const [dropdownPositions, setDropdownPositions] = useState<
    Map<string, { top: number; left: number }>
  >(new Map());

  const [activePath, setActivePath] = useState<string | null>(null);

  const handleAddEquation = useCallback(
    (event: React.MouseEvent, path: Path) => {
      const pathString = JSON.stringify(path);

      console.log(pathString);
      if (!dropdownPositions.has(pathString)) {
        const target = event.currentTarget as HTMLDivElement;
        const targetRect = target.getBoundingClientRect();

        setDropdownPositions((prevPositions) => {
          const newPositions = new Map(prevPositions);
          newPositions.set(pathString, {
            top: targetRect.top + 40,
            left: targetRect.left + 40,
          });
          return newPositions;
        });
      }
      setShowDropdown((prevState) => !prevState);
      setActivePath(pathString);
    },
    [dropdownPositions]
  );

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
    const index = props.element.children[0].text.charCodeAt(0);

    if (element.type === "paragraph") {
      return (
        <div className="group relative" {...attributes}>
          <p className="pl-6 leading-relaxed">{children}</p>
          <div
            className="absolute -left-4 top-3 -mt-5 flex h-10 w-10 cursor-pointer items-center justify-center opacity-0 group-hover:opacity-100"
            onClick={(event) =>
              handleAddEquation(event, ReactEditor.findPath(editor, element))
            }
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

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(
    dropdownRef,
    () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    },
    (element) => dropdownRef.current?.contains(element) ?? false
  );

  return (
    <div
      tabIndex={0}
      className="relative mb-2 h-[400px] rounded-md border border-2 border-gray-200 border-gray-100 p-4 shadow-md focus:outline-none focus-visible:border-gray-400"
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
        {showDropdown && activePath && (
          <div
            className="fixed z-10 mt-2"
            style={{
              top: dropdownPositions.get(activePath)?.top,
              left: dropdownPositions.get(activePath)?.left,
            }}
          >
            <MiniDropdown ref={dropdownRef} />
          </div>
        )}
      </Slate>
    </div>
  );
};

export default DocumentEditor;
