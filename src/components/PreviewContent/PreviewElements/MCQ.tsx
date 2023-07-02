import React, { useState } from "react";
import { CollapsibleAudioPlayer } from "./CollapsibleAudio";
import { Button } from "@/components/ui/button";

export const MCQ = ({ node, children }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleCheck = () => {
    const correctOption = node.children.find(
      (option) => option.correctAnswer === true
    );
    setIsCorrect(selectedOption === correctOption.id);
    setAnswerChecked(true);
  };

  return (
    <div>
      {node.children.map((item, i) => {
        switch (item.type) {
          case "paragraph":
            return (
              <p className="mb-5" key={i}>
                {item.children[0].text}
              </p>
            );
          case "option-list-item":
            return (
              <label
                htmlFor={item.id}
                key={i}
                className={`mb-1 mt-1 flex  cursor-pointer items-center rounded-md border border-gray-700 p-2 transition duration-300 hover:border-gray-500 hover:bg-accent/50 ${
                  selectedOption === item.id
                    ? " border-brand bg-brand text-white dark:border-foreground dark:bg-white dark:text-background "
                    : ""
                }`}
              >
                <input
                  type="radio"
                  id={item.id}
                  value={item.id}
                  checked={selectedOption === item.id}
                  onChange={handleOptionChange}
                  disabled={answerChecked}
                  className="ml-1 mr-2 hidden"
                />
                <div
                  className={`mr-3 flex h-[28px] w-[28px] items-center justify-center rounded-md border ${
                    selectedOption === item.id
                      ? "border-white dark:border-gray-700"
                      : "border-gray-700"
                  }`}
                >
                  {String.fromCharCode(65 + i - 1).toUpperCase()}{" "}
                </div>
                {item.children[0].text}
              </label>
            );

          default:
            return null;
        }
      })}
      <Button
        variant="outline"
        className="mt-3 w-full "
        onClick={handleCheck}
        disabled={answerChecked}
      >
        Check
      </Button>
      {answerChecked && (isCorrect ? "Correct" : "Incorrect")}
    </div>
  );
};
