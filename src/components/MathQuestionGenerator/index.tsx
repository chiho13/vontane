import { PromptSelector } from "../PromptSelector";
import { mathQuestionTopics } from "@/data/mathQuestionTopics";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";

export const MathQuestionGenerator = () => {
  const [mathQuestions, setQuestions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
  };

  useEffect(() => {
    if (mathQuestions) {
      setIsLoading(true);
      getQuestionRefetch();
    }
  }, [mathQuestions]);

  useEffect(() => {
    if (!getQuestionLoading) {
      if (getQuestionData) {
        console.log(getQuestionData);
        setIsLoading(false);
      }
      if (getQuestionError) {
        console.error(getQuestionError);
        // Handle the error as needed
      }
    }
  }, [getQuestionData, getQuestionError, getQuestionLoading]);

  return (
    <PromptSelector
      subject="Maths "
      questionTopics={mathQuestionTopics}
      setQuestionHandler={setQuestionHandler}
      genLoading={isLoading}
    />
  );
};
