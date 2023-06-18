import { EditorContext } from "@/contexts/EditorContext";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createEditor, Text } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { ElementSelector } from "@/components/DocumentEditor/EditorElements";
import { useRouter } from "next/router";

export const PreviewContent = () => {
  const { editor: fromEditor } = useContext(EditorContext);
  const [localValue, setLocalValue] = useState(fromEditor.children);
  const editor = useMemo(() => withReact(createEditor()), []);
  const MemoizedElementSelector = React.memo(ElementSelector);
  const router = useRouter();
  const workspaceId = router.query.workspaceId;

  useEffect(() => {
    setLocalValue(fromEditor.children);
  }, [fromEditor.children]);

  console.log(fromEditor.children);
  return <DisplayContent value={fromEditor.children} />;
};

const initialValue = [
  {
    type: "paragraph",
    children: [
      {
        text: "This example shows what happens when the Editor is set to readOnly, it is not editable",
      },
    ],
  },
];

export function DisplayContent({ value }) {
  // Recursively parse through the document structure
  const parseNodes = (nodes) => {
    return nodes.map((node) => {
      if (Text.isText(node)) {
        // Handle text nodes
        return node.text;
      } else if ("children" in node) {
        // Handle other nodes
        const children = parseNodes(node.children);
        switch (node.type) {
          case "paragraph":
            return <p>{children}</p>;
          default:
            return <span>{children}</span>;
        }
      }
    });
  };

  return <>{parseNodes(value)}</>;
}
