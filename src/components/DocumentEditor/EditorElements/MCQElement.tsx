import React, { useContext, useEffect } from "react";
import { ReactEditor } from "slate-react";
import { Transforms } from "slate";
import { EditorContext } from "@/contexts/EditorContext";
import { OptionMenu } from "../OptionMenu";
import { hasSlideElement } from "@/utils/helpers";
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

    return <Component {...props} questionNumber={questionNumber} />;
  };
};

export const MCQElement: React.FC<MCQElementProps> = withQuestionNumbering(
  ({ element, attributes, children, questionNumber }) => {
    const { editor } = useContext(EditorContext);
    const path = ReactEditor.findPath(editor, element);
    const hasSlide = hasSlideElement(editor.children);

    useEffect(() => {
      Transforms.setNodes(editor, { questionNumber }, { at: path });
    }, []);
    console.log(JSON.stringify(element));
    return (
      <div
        {...attributes}
        className={` relative mt-[2px] mb-[2px]  grid gap-3 rounded-md border border-gray-300 bg-gray-100 p-4  dark:border-gray-700 dark:bg-muted

        `}
        data-id={element.id}
        data-path={JSON.stringify(path)}
      >
        {/* <div className="absolute  top-0 right-2">
          <OptionMenu element={element} />
        </div> */}
        {/* <div className="text-bold" contentEditable={false}>
          {questionNumber} )
        </div> */}
        {children}
      </div>
    );
  }
);
