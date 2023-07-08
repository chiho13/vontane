import { PromptSelector } from "../PromptSelector";
import { mathQuestionTopics } from "@/data/mathQuestionTopics";
import { useContext, useEffect, useState } from "react";
import { api } from "@/utils/api";
import { EditorContext } from "@/contexts/EditorContext";
import { Transforms, Path, BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
import { ErrorAlert } from "../ErrorAlert";
import { genNodeId, addRandomIds } from "@/hoc/withID";

export const MathQuestionGenerator = () => {
  const [mathQuestions, setQuestions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { editor, activePath } = useContext(EditorContext);
  const [showErrorAlert, setShowErrorAlert] = useState<boolean>(false);
  const [triggerRefetch, setTriggerRefetch] = useState(false);

  const {
    data: getQuestionData,
    error: getQuestionError,
    isLoading: getQuestionLoading,
    refetch: getQuestionRefetch,
  } = api.gpt.mathQuestions.useQuery(
    { mathQuestions },
    {
      enabled: false,
    }
  );

  const setQuestionHandler = (value) => {
    setQuestions(value);
    setTriggerRefetch((prev) => !prev);
  };

  const insertNodesAtGivenPath = (
    editor: any,
    nodesArray: any[],
    startingPath: any[]
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
    if (mathQuestions && triggerRefetch !== null) {
      setIsLoading(true);
      getQuestionRefetch();
    }
  }, [mathQuestions, triggerRefetch]);

  useEffect(() => {
    if (!getQuestionLoading) {
      if (getQuestionData) {
        // const currentElement = document.querySelector(`[data-id="${id}"]`);
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
          // You can set parsedJson to a default value or handle the error in a different way
          jsonData = null;
        }
      }
      if (getQuestionError) {
        console.error(getQuestionError);
        // Handle the error as needed
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
        subject="Maths "
        questionTopics={mathQuestionTopics}
        setQuestionHandler={setQuestionHandler}
        genLoading={isLoading}
      />
    </>
  );
};
