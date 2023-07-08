import React, { useState, useEffect } from "react";
import { mathQuestionTopics } from "@/data/mathQuestionTopics";
import { ChevronRight, Minus, Plus } from "lucide-react";
import { useTheme } from "styled-components";
import { motion } from "framer-motion";
import LoadingSpinner from "@/icons/LoadingSpinner";

const TopicList = ({
  topics,
  onSelect,
  selectedValue,
  isLastLevel,
  quantities = {},
  disableOtherLevels = false,
}) => {
  const theme = useTheme();

  const decrement = (topic) => {
    const newValue =
      ((quantities && quantities.hasOwnProperty(topic) && quantities[topic]) ||
        0) - 1;
    if (newValue >= 0) {
      onSelect(topic, newValue);
    }
  };

  const increment = (topic) => {
    const newValue =
      ((quantities && quantities.hasOwnProperty(topic) && quantities[topic]) ||
        0) + 1;
    if (newValue <= 10) {
      onSelect(topic, newValue);
    }
  };

  return (
    <ul className="mr-2 max-h-[350px] overflow-y-auto">
      {topics.map((topic) => (
        <li
          key={topic}
          className={`mb-1 flex cursor-pointer items-center rounded-md px-3 py-1 text-sm text-gray-500 ${
            topic === selectedValue ? "text-black" : ""
          }`}
          style={{
            backgroundColor: topic === selectedValue ? "#eee" : "transparent",
            pointerEvents: disableOtherLevels ? "none" : "auto",
            opacity: disableOtherLevels ? 0.5 : 1,
          }}
        >
          <div
            onClick={() => onSelect(topic)}
            className="flex w-full items-center justify-between"
          >
            {topic}
            {!isLastLevel && (
              <ChevronRight className="ml-2 w-4 text-darkgray" />
            )}
          </div>
          {isLastLevel && topic === selectedValue && (
            <div className="ml-2 flex items-center rounded border border-gray-200">
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
                className=" h-[28px] w-6 border-l text-center text-[12px] [-moz-appearance:_textfield] focus:outline-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
              />
              <div>
                <button
                  type="button"
                  className="flex h-[14px] w-[14px] items-center justify-center border-l     border-b  bg-white  text-gray-600 transition hover:opacity-75"
                  onClick={() => increment(topic)}
                >
                  <Plus className="h-3" />
                </button>
                <button
                  type="button"
                  className="flex h-[14px] w-[14px]  items-center justify-center  border-l bg-white  text-gray-600 transition hover:opacity-75"
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

  const handleTopicSelect = (value, newQuantity, parentKey) => {
    setSelectedValue(value);
    onChange({ topic: value, quantity: newQuantity, parent: parentKey });
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

export const PromptSelector = ({
  subject,
  questionTopics,
  setQuestionHandler,
  genLoading,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<any>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [hasPressedWrite, setHasPressedWrite] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [subtopicLevels, setSubtopicLevels] = useState({});

  const handleLevelSelect = (level) => {
    if (selectedLevel !== level) {
      setSelectedLevel(level);
      setSelectedSubtopic(null);
    }
  };

  const getParentKey = (selectedTopic, topics) => {
    let parentKey: any = null;
    Object.entries(topics).forEach(([key, value]) => {
      if (Array.isArray(value) && value.includes(selectedTopic)) {
        parentKey = key;
      } else if (typeof value === "object" && value !== null) {
        const childParentKey = getParentKey(selectedTopic, value);
        if (childParentKey !== null) {
          parentKey = childParentKey;
        }
      }
    });
    return parentKey;
  };

  const createCustomPrompt = (subject, level, subtopics) => {
    let subtopicArray = Object.entries(subtopics).map(
      ([subTopic, quantity]) => {
        const [main, ...sub] = subTopic.split(" > ");
        const parentKey = getParentKey(main, level.topics);
        return {
          subject,
          level: level.level,
          mainTopic: parentKey,
          subTopic: main,
          quantity,
        };
      }
    );

    return subtopicArray;
  };

  const handleWriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (questionCount === 0) {
      setHasPressedWrite(true);
      setErrorMessage("Please choose a topic");
      return;
    }

    // Handle the write action with the selected topic
    const questionsArr = createCustomPrompt(
      subject,
      selectedLevel,
      selectedSubtopic
    );
    const questionsArrStringify = JSON.stringify(questionsArr);
    console.log(questionsArrStringify);
    setQuestionHandler(questionsArrStringify);
  };

  useEffect(() => {
    if (selectedSubtopic) {
      setHasPressedWrite(false);
    }
  }, [selectedSubtopic]);

  const handleSubtopicSelect = (selected) => {
    const { topic, quantity } = selected;
    setSelectedSubtopic((prevState: any) => {
      const newState = { ...prevState };

      if (quantity === 0) {
        delete newState[topic];
      } else {
        newState[topic] = quantity;
      }

      const total: any = Object.values(newState).reduce(
        (a: any, b: any) => a + b,
        0
      );

      if (total <= 5) {
        setQuestionCount(total);
        setSubtopicLevels((prevLevels) => {
          const newLevels = { ...prevLevels };
          newLevels[topic] = selectedLevel.level;
          return newLevels;
        });
        return newState;
      }

      return prevState;
    });
  };

  return (
    <div className="mt-2 block">
      <div className="flex rounded-md border border-gray-200 pt-2 pl-2">
        <TopicList
          topics={questionTopics.map((level) => level.level)}
          onSelect={(level) => {
            handleLevelSelect(
              questionTopics.find((lvl) => lvl.level === level)
            );
          }}
          isLastLevel={false}
          selectedValue={selectedLevel?.level}
          disableOtherLevels={questionCount as any}
        />
        {selectedLevel && (
          <RecursiveList
            data={selectedLevel.topics}
            onChange={handleSubtopicSelect}
            quantities={selectedSubtopic}
          />
        )}
      </div>
      <div className="mt-4 flex justify-between">
        <div>{questionCount} / 5 questions</div>
        <div className="flex ">
          {hasPressedWrite && (
            <div className="mt-2 mr-2 text-sm text-red-400">{errorMessage}</div>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex h-[34px] min-w-[65px] items-center rounded-md border border-gray-300 py-1 px-2 text-sm text-gray-500 shadow-sm  hover:bg-gray-100 focus:outline-none"
            onClick={handleWriteClick}
            disabled={genLoading}
          >
            {genLoading ? (
              <>
                <LoadingSpinner />
                <div className="ml-2">Creating...</div>
              </>
            ) : (
              <div>Create</div>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
