import React, { useState, useEffect } from "react";
import { mathQuestionTopics } from "@/data/mathQuestionTopics";
import { ChevronRight, Minus, Plus } from "lucide-react";
import { useTheme } from "styled-components";
import { motion } from "framer-motion";

const TopicList = ({
  topics,
  onSelect,
  selectedValue,
  isLastLevel,
  quantities = {},
}) => {
  const theme = useTheme();

  const increment = (topic) => {
    const newValue = (quantities[topic] || 0) + 1;
    if (newValue <= 10) {
      onSelect(topic, newValue);
    }
  };

  const decrement = (topic) => {
    const newValue = (quantities[topic] || 0) - 1;
    if (newValue >= 0) {
      onSelect(topic, newValue);
    }
  };

  return (
    <ul className="mr-2 max-h-[300px] overflow-y-auto">
      {topics.map((topic) => (
        <li
          key={topic}
          className={`mt-1 flex cursor-pointer items-center rounded-md px-2 py-1 text-sm text-gray-500 ${
            topic === selectedValue ? "text-black" : ""
          }`}
          style={{
            backgroundColor: topic === selectedValue ? "#eee" : "transparent",
          }}
        >
          <div onClick={() => onSelect(topic)} className="flex items-center ">
            {topic}
            {!isLastLevel && (
              <ChevronRight
                className="ml-2 w-4"
                color={theme.colors.darkgray}
              />
            )}
          </div>
          {isLastLevel && topic === selectedValue && (
            <div class="ml-2 flex items-center rounded border border-gray-200">
              <input
                type="number"
                value={
                  quantities && quantities.hasOwnProperty(topic)
                    ? quantities[topic]
                    : 0
                }
                onChange={(e) => onSelect(topic, parseInt(e.target.value, 10))}
                min={0}
                max={10}
                className=" h-[20px] w-6  rounded-l-md border-r text-center text-[12px] [-moz-appearance:_textfield] focus:outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
              />
              <div>
                <button
                  type="button"
                  className="flex h-[10px] w-6 items-center justify-center rounded-tr-md border-b  bg-white  text-gray-600 transition hover:opacity-75"
                  onClick={() => increment(topic)}
                >
                  <Plus className="h-3" />
                </button>
                <button
                  type="button"
                  className="flex h-[10px] w-6 items-center justify-center rounded-br-md bg-white  text-gray-600 transition hover:opacity-75"
                  onClick={() => decrement(topic)}
                >
                  <Minus className="h-3" />
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

const RecursiveList = ({ data, onChange, quantities }) => {
  const [selectedValue, setSelectedValue] = useState(null);

  if (!data) {
    return null;
  }

  const handleTopicSelect = (value, newQuantity) => {
    setSelectedValue(value);
    onChange({ topic: value, quantity: newQuantity });
  };

  if (Array.isArray(data)) {
    return (
      <TopicList
        topics={data}
        onSelect={handleTopicSelect}
        selectedValue={selectedValue}
        isLastLevel={true}
        quantities={quantities}
      />
    );
  }

  const subtopics = Object.keys(data);
  return (
    <div style={{ display: "flex" }}>
      <TopicList
        topics={subtopics}
        onSelect={setSelectedValue}
        selectedValue={selectedValue}
        isLastLevel={false}
        quantities={quantities}
      />
      {selectedValue && (
        <RecursiveList
          data={data[selectedValue]}
          onChange={onChange}
          quantities={quantities}
        />
      )}
    </div>
  );
};

export const PromptSelector = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);

  const [hasPressedWrite, setHasPressedWrite] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [questionCount, setQuestionCount] = useState(0);

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
    setSelectedSubtopic(null);
  };

  const handleWriteClick = () => {
    if (questionCount === 0) {
      setHasPressedWrite(true);
      setErrorMessage("Please choose a topic");
      return;
    }

    // Handle the write action with the selected topic
    console.log("generated");
  };

  useEffect(() => {
    if (selectedSubtopic) {
      setHasPressedWrite(false);
    }
  }, [selectedSubtopic]);

  const handleSubtopicSelect = (selected) => {
    const { topic, quantity } = selected;
    setSelectedSubtopic((prevState) => {
      const newState = { ...prevState, [topic]: quantity || 0 };
      const total = Object.values(newState).reduce((a, b) => a + b, 0);

      if (total <= 15) {
        setQuestionCount(total);
        return newState;
      }

      return prevState;
    });
  };

  return (
    <div className="mt-2 block">
      <div className="flex">
        <TopicList
          topics={mathQuestionTopics.map((level) => level.level)}
          onSelect={(level) => {
            handleLevelSelect(
              mathQuestionTopics.find((lvl) => lvl.level === level)
            );
          }}
          isLastLevel={false}
          selectedValue={selectedLevel?.level}
        />
        {selectedLevel && (
          <RecursiveList
            data={selectedLevel.topics}
            onChange={handleSubtopicSelect}
            quantities={selectedSubtopic}
          />
        )}
      </div>
      <div className="mt-2 flex justify-between">
        <div>{questionCount} / 15 questions</div>
        <div className="flex ">
          {hasPressedWrite && (
            <div className="mt-2 mr-2 text-sm text-red-400">{errorMessage}</div>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="rounded-md border border-gray-300 py-1 px-2 text-sm text-gray-500 shadow-sm  hover:bg-gray-100 focus:outline-none"
            onClick={handleWriteClick}
          >
            Write
          </motion.button>
        </div>
      </div>
    </div>
  );
};