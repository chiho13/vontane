import { PromptSelector } from "../PromptSelector";
import { englishQuestionTopics } from "@/data/englishQuestionTopics";
import { useContext, useEffect, useState } from "react";
import { api } from "@/utils/api";
import { EditorContext } from "@/contexts/EditorContext";
import { Transforms, Path, BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
import { ErrorAlert } from "../ErrorAlert";
import { genNodeId, addRandomIds } from "@/hoc/withID";

export const convertUnderscoresToBlank = (text) => {
  const regex = /_{3,}/g;
  const parts = text.split(regex);

  // Check if the text contains three or more underscores
  if (parts.length <= 1) {
    return [{ text }];
  }

  const result = [];

  for (let i = 0; i < parts.length; i++) {
    result.push({ text: parts[i] });

    if (i < parts.length - 1) {
      result.push({ text: " ", blank: true });
      result.push({ text: " " });
    }
  }

  return result;
};

const processNode = (node) => {
  // If the node is of type "mcq", process its children
  if (node.type === "mcq") {
    return {
      ...node,
      children: node.children.map((child) => {
        if (child.type === "list-item") {
          return {
            ...child,
            children: convertUnderscoresToBlank(child.children[0].text),
          };
        }
        return child;
      }),
    };
  }
  return node;
};

export const EnglishQuestionGenerator = () => {
  const [englishQuestions, setQuestions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { editor, activePath } = useContext(EditorContext);
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const {
    data: getQuestionData,
    error: getQuestionError,
    isLoading: getQuestionLoading,
    refetch: getQuestionRefetch,
  } = api.gpt.englishQuestions.useQuery(
    { englishQuestions },
    {
      enabled: false,
    }
  );

  const setQuestionHandler = (value) => {
    setQuestions(value);
    console.log(value);
    setTriggerRefetch((prev) => !prev);
  };

  const insertNodesAtGivenPath = (
    editor: BaseEditor & ReactEditor,
    nodesArray: any[],
    startingPath: Path
  ) => {
    nodesArray.forEach((node, index) => {
      // Calculate the path for each node in the array
      const path = Path.next([
        ...startingPath.slice(0, -1),
        startingPath[startingPath.length - 1] + index,
      ]);

      // Insert the node at the calculated path
      Transforms.insertNodes(editor, node, { at: path });
    });
  };

  console.log(activePath);

  useEffect(() => {
    if (englishQuestions && triggerRefetch !== null) {
      setIsLoading(true);
      getQuestionRefetch();
    }
  }, [englishQuestions, triggerRefetch]);

  useEffect(() => {
    if (!getQuestionLoading) {
      if (getQuestionData) {
        console.log(getQuestionData);
        let jsonData;

        try {
          jsonData = JSON.parse(getQuestionData);
          jsonData = addRandomIds(jsonData);
          insertNodesAtGivenPath(editor, jsonData, JSON.parse(activePath));
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
          console.error("Failed to parse JSON:", error);
          setShowErrorAlert(true);
          jsonData = null;
        }
      }
      if (getQuestionError) {
        console.error(getQuestionError);
        setIsLoading(false);
      }
    }
  }, [getQuestionData, getQuestionError, getQuestionLoading]);

  return (
    <>
      {showErrorAlert && (
        <ErrorAlert
          message="An error occurred while fetching the question."
          alertType="error"
          duration={10000}
          onClose={() => setShowErrorAlert(false)}
        />
      )}
      <PromptSelector
        subject="English"
        questionTopics={englishQuestionTopics}
        setQuestionHandler={setQuestionHandler}
        genLoading={isLoading}
      />
    </>
  );
};
