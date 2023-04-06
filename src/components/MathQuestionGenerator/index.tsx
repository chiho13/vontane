import { PromptSelector } from "../PromptSelector";
import { mathQuestionTopics } from "@/data/mathQuestionTopics";

export const MathQuestionGenerator = () => {
  return <PromptSelector questionTopics={mathQuestionTopics} />;
};
