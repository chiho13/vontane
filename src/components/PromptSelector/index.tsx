import React, { useState } from "react";
import "./PromptSelector.css";

const PromptSelector = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [questionCount, setQuestionCount] = useState(1);

  const categories = {
    GCSE: {
      Number: [
        "Integers, decimals, and fractions",
        "Factors, multiples, and primes",
        "Rounding numbers and significant figures",
        "Standard form",
        "Surds",
        "Percentage calculations",
        "Ratio and proportion",
      ],
      Algebra: [
        "Simplifying expressions",
        "Expanding brackets and factorization",
        "Solving linear equations",
        "Quadratic equations",
        "Simultaneous equations",
        "Inequalities",
        "Algebraic fractions",
        "Indices and index laws",
        "Sequences (arithmetic and geometric)",
        "Graphs (linear, quadratic, cubic, and reciprocal)",
        "Direct and inverse proportion",
      ],
      "Ratio, Proportion, and Rates of Change": [
        "Direct and inverse proportion",
        "Compound measures (e.g., speed, density, pressure)",
      ],
    },
  };

  const incrementCount = () => setQuestionCount(questionCount + 1);
  const decrementCount = () => setQuestionCount(Math.max(1, questionCount - 1));

  const renderGridItems = (items, onClick) => (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div
          key={item}
          className="flex cursor-pointer items-center justify-center border p-2"
          onClick={() => onClick(item)}
        >
          {item}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col">
      {!selectedCategory &&
        renderGridItems(Object.keys(categories), setSelectedCategory)}
      {selectedCategory &&
        !selectedTopic &&
        renderGridItems(
          Object.keys(categories[selectedCategory]),
          setSelectedTopic
        )}
      {selectedTopic &&
        !selectedSubTopic &&
        renderGridItems(
          categories[selectedCategory][selectedTopic],
          setSelectedSubTopic
        )}
      {selectedSubTopic && (
        <div className="mt-2 flex items-center justify-center">
          <button
            className="mx-1 cursor-pointer rounded border border-gray-300 bg-gray-200 px-2 py-1"
            onClick={decrementCount}
          >
            -
          </button>
          <span>{questionCount}</span>
          <button
            className="mx-1 cursor-pointer rounded border border-gray-300 bg-gray-200 px-2 py-1"
            onClick={incrementCount}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default PromptSelector;
