import React, { useContext } from "react";
import { ReactEditor } from "slate-react";
import { Transforms } from "slate";
import { EditorContext } from "@/contexts/EditorContext";

interface MCQElementProps {
  attributes: any;
  children: React.ReactNode;
  element: any;
}

const findMCQElements = (nodes) => {
  let mcqElements = [];
  nodes.forEach((node) => {
    if (node.type === "mcq") {
      mcqElements.push(node);
    } else if (node.children && Array.isArray(node.children)) {
      mcqElements.push(...findMCQElements(node.children));
    }
  });
  return mcqElements;
};

const withQuestionNumbering = (Component) => {
  return (props) => {
    const { element } = props;
    const { editor } = useContext(EditorContext);

    if (!editor) {
      return <Component {...props} questionNumber={null} />;
    }

    // Find all MCQ elements within the editor
    const mcqElements = findMCQElements(editor.children);

    // Show question number for all MCQ elements
    const questionNumber =
      mcqElements.findIndex((mcq) => mcq.id === element.id) + 1;

    // Set questionNumber property using Transforms.setNodes
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { questionNumber }, { at: path });

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
        className="mcq-element mb-4 mr-4 rounded-md border-2 bg-gray-100 p-4"
        data-id={element.id}
        data-path={JSON.stringify(path)}
      >
        <div className="text-bold">Question {questionNumber}</div>
        {children}
      </div>
    );
  }
);
