import { PromptSelector } from "../PromptSelector";
import { mathQuestionTopics } from "@/data/mathQuestionTopics";
import { useEffect, useState } from "react";

export const MathQuestionGenerator = () => {
  const [questions, setQuestions] = useState("");

  useEffect(() => {
    console.log(questions);
  }, [questions]);
  return (
    <PromptSelector
      subject="Maths "
      questionTopics={mathQuestionTopics}
      setQuestions={setQuestions}
    />
  );
};
