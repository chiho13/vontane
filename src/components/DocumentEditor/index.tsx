import React, {
  useEffect,
  useCallback,
  useMemo,
  useState,
  useRef,
  useContext,
} from "react";
import { createEditor, Editor, Transforms, Path, BaseEditor } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { Plus } from "lucide-react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

import { useTheme } from "styled-components";
import useClickOutside from "@/hooks/useClickOutside";

import { LayoutContext } from "../Layouts/AccountLayout";

interface DocumentEditorProps {
  handleTextChange?: (value: any) => void;
}

type CustomElement = {
  type: "paragraph" | "equation";
  children: CustomText[];
  latex?: string; // Add this line for the latex string
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
  isOpen: boolean;
  onSubmit: (latex: string) => void;
}

const MiniDropdown = React.forwardRef<HTMLDivElement, MiniDropdownProps>(
  ({ isOpen, onSubmit }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (textareaRef.current) {
          onSubmit(textareaRef.current.value);
        }
      }
    };
    return (
      <div
        ref={ref}
        className="dropdown-menu rounded-md border border-gray-200 bg-white p-2 shadow-md"
      >
        <textarea
          className="w-full resize-none"
          ref={textareaRef}
          autoFocus
          onKeyDown={handleKeyDown}
        />
      </div>
    );
  }
);

MiniDropdown.displayName = "MiniDropdown";

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  handleTextChange,
}) => {
  const theme = useTheme();
  const { isLocked } = useContext(LayoutContext);
  const editor = useMemo(() => withReact(createEditor()), []);
  const [slatevalue, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ]);

  const [showDropdown, setShowDropdown] = useState(false);
  const [offsetDropdownPosition, setOffsetDropdownPosition] = useState<number>(
    isLocked ? -150 : 0
  );

  useEffect(() => {
    setOffsetDropdownPosition(isLocked ? -150 : 0);
  }, [isLocked]);

  const [dropdownPositions, setDropdownPositions] = useState<
    Map<string, { top: number; left: number }>
  >(new Map());

  const [activePath, setActivePath] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [addedParagraphs, setAddedParagraphs] = useState<Set<string>>(
    new Set()
  );

  const openMiniDropdown = useCallback(
    (event: React.MouseEvent, path: Path) => {
      const currentpathString = JSON.stringify(path);

      const offsetDropdownPosition = isLocked ? -150 : 0;
      const [currentNode] = Editor.node(editor, path);
      const { selection } = editor;

      //   const lastNode = Editor.node(editor, selection.focus);
      if (!selection) return;

      const [parentNode, parentPath] = Editor.parent(
        editor,
        selection.anchor.path
      );

      const parentpathString = JSON.stringify(parentPath);

      const [lastNode, lastPath] = Editor.last(editor, []);

      const lastpathString = JSON.stringify(lastPath.slice(0, -1));
      //   console.log(lastPath[0]);
      const hasEmptyParagraphNode =
        currentNode.type === "paragraph" &&
        currentNode.children.length === 1 &&
        currentNode.children[0].text === "";

      const hasEquationNode =
        currentNode.type === "equation" && currentNode.latex !== "";

      console.log(currentNode, hasEquationNode);

      console.log("hasEmptyParagraphNode", hasEmptyParagraphNode);
      console.log(Path.next(path));
      if (
        !hasEmptyParagraphNode &&
        !hasEquationNode &&
        parentpathString === lastpathString
      ) {
        Transforms.insertNodes(
          editor,
          { type: "paragraph", children: [{ text: "" }] },
          { at: Path.next(path) }
        );
      }

      setShowDropdown((prevState) => !prevState);
      setActivePath(currentpathString);
    },
    [dropdownPositions, isLocked]
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

  const handleAddEquation = useCallback(
    (latex: string, path: Path) => {
      if (showDropdown) {
        const equationNode: CustomElement = {
          type: "equation",
          latex,
          children: [{ text: "" }],
        };

        // Check if the first paragraph is empty
        const [currentNode] = Editor.node(editor, path);

        // console.log(currentNode.children[0].children[0]);

        console.log(currentNode.children[0], path);
        console.log(
          currentNode.children[0].type === "paragraph",
          currentNode.children[0].text === ""
        );

        console.log(path);

        const isEmptyNode =
          currentNode.children[0].type === "paragraph" &&
          currentNode.children[0].text === "" &&
          currentNode.children.length === 1;

        console.log(isEmptyNode);
        if (!isEmptyNode) {
          // Replace the first paragraph with the equation node
          Transforms.setNodes(editor, equationNode, { at: path });

          // Insert an empty paragraph after the equation node
          Transforms.insertNodes(
            editor,
            { type: "paragraph", children: [{ text: "" }] },
            { at: Path.next(path) }
          );

          // Set the selection to the start of the new paragraph
          const newPath = Path.next(path);
          const newSelection = Editor.start(editor, newPath);
          Transforms.select(editor, newSelection);
        } else {
          // Insert the equation node after the current node
          Transforms.insertNodes(editor, equationNode, { at: Path.next(path) });

          // Insert an empty paragraph after the equation node
          Transforms.insertNodes(
            editor,
            { type: "paragraph", children: [{ text: "" }] },
            { at: Path.next(Path.next(path)) }
          );

          // Set the selection to the start of the new paragraph
          const newPath = Path.next(Path.next(path));
          const newSelection = Editor.start(editor, newPath);
          Transforms.select(editor, newSelection);
        }
      }
    },
    [showDropdown]
  );

  const toggleRef = useRef<HTMLButtonElement>(null);

  const renderElement = useCallback((props) => {
    const { attributes, children, element } = props;
    return (
      <div className="group relative" {...attributes}>
        {element.type === "equation" && (
          <span contentEditable={false}>
            <BlockMath math={element.latex || ""} />
          </span>
        )}
        {element.type === "paragraph" && (
          <p className="pl-6 leading-relaxed">{children}</p>
        )}
        <div className="absolute -left-4 top-3 -mt-5 flex h-10 w-10 cursor-pointer items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            className="rounded-md hover:bg-gray-200"
            onClick={(event) => {
              event.stopPropagation();
              openMiniDropdown(event, ReactEditor.findPath(editor, element));
            }}
            ref={toggleRef}
          >
            <Plus color={theme.colors.darkgray} />
          </button>
        </div>
      </div>
    );
  }, []);

  useClickOutside(
    dropdownRef,
    () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    },
    toggleRef
  );

  return (
    <div
      tabIndex={0}
      className="relative mb-2 h-[400px] rounded-md border border-2 border-gray-200 border-gray-100 p-4 shadow-md focus:outline-none focus-visible:border-gray-400"
    >
      <Slate
        editor={editor}
        value={slatevalue}
        onChange={(newValue) => {
          setValue(newValue);

          console.log(newValue);
          if (handleTextChange) {
            handleTextChange(newValue);
          }
        }}
      >
        <Editable renderElement={renderElement} onKeyDown={handleKeyDown} />
        {showDropdown && activePath && (
          <div
            className="fixed z-10 mt-2 w-[400px]"
            style={{
              top: dropdownPositions.get(activePath)?.top,
              left: dropdownPositions.get(activePath)?.left,
              transform: "translateX(20px)",
            }}
          >
            <MiniDropdown
              ref={dropdownRef}
              isOpen={showDropdown}
              onSubmit={(latex) => {
                handleAddEquation(latex, JSON.parse(activePath));
                setShowDropdown(false);
              }}
            />
          </div>
        )}
      </Slate>
    </div>
  );
};

export default DocumentEditor;
