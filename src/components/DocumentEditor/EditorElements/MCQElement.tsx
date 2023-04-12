import React, { useContext } from "react";
import { ReactEditor } from "slate-react";
import { Editor } from "slate";
import { EditorContext } from "@/contexts/EditorContext";

interface MCQElementProps {
  attributes: any;
  children: React.ReactNode;
  element: any;
}

const findMCQElements = (node) => {
  if (node.type === "mcq") {
    return [node];
  }

  if (!node.children || !Array.isArray(node.children)) {
    return [];
  }

  return node.children.flatMap(findMCQElements);
};

const withQuestionNumbering = (Component) => {
  return (props) => {
    const { element } = props;
    const { editor } = useContext(EditorContext);
    console.log("Editor:", editor);
    if (!editor) {
      return <Component {...props} questionNumber={null} />;
    }

    // Find all MCQ elements within the editor
    const mcqElements = editor.children.filter((node) => node.type === "mcq");

    console.log("MCQ Elements:", mcqElements);
    console.log("Current element ID:", element.id);

    // Show question number for all MCQ elements
    const questionNumber =
      mcqElements.findIndex((mcq) => mcq.id === element.id) + 1;

    return <Component {...props} questionNumber={questionNumber} />;
  };
};

export const MCQElement: React.FC<MCQElementProps> = withQuestionNumbering(
  ({ element, attributes, children, questionNumber }) => {
    const { editor } = useContext(EditorContext);
    const path = ReactEditor.findPath(editor, element);
    return (
      <div
        {...attributes}
        className="mcq-element rounded-md bg-gray-100 p-4"
        data-id={element.id}
        data-path={JSON.stringify(path)}
      >
        <div className="text-bold">Question {questionNumber}</div>
        {children}
      </div>
    );
  }
);
