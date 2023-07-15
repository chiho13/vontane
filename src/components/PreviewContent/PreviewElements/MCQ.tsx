import React, { useContext, useState } from "react";
import { CollapsibleAudioPlayer } from "./CollapsibleAudio";
import { Button } from "@/components/ui/button";
import { AudioManagerContext } from "@/contexts/PreviewAudioContext";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { AiFillSound } from "react-icons/ai";

import { compareTwoStrings } from "@/utils/helpers";
import { renderToStaticMarkup } from "react-dom/server";

function searchWordInTranscript(transcript, searchTerm) {
  let result: any = [];

  // Split the search term into individual words
  let searchWords = searchTerm.toLowerCase().split(" ");

  let i = 0;
  while (i < transcript.length) {
    console.log(compareTwoStrings(transcript[i].word, searchWords[0]));
    if (compareTwoStrings(transcript[i].word, searchWords[0]) > 0.6) {
      // Tweaked this line
      let found = true;
      for (let j = 1; j < searchWords.length; j++) {
        if (
          i + j >= transcript.length ||
          compareTwoStrings(transcript[i + j].word, searchWords[j]) <= 0.6 // And this line
        ) {
          found = false;
          break;
        }
      }
      if (found) {
        result.push({
          start: transcript[i].start,
          end: transcript[i + searchWords.length - 1].end + 0.18,
        });
        i += searchWords.length - 1;
      }
    }
    i++;
  }

  return result;
}

export const MCQ = ({ node, children }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const { playAudio, pauseAudio } = useContext(AudioManagerContext);
  // console.log(nodeTranscript);

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

  let currentAudio: any = null;

  const playAudioSegment = async (audioUrl, start, end) => {
    // Stop the current audio if it's playing
    if (currentAudio) {
      await currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Create a new Audio object and start playing
    currentAudio = new Audio(audioUrl);
    currentAudio.currentTime = start;
    try {
      await currentAudio.play();
    } catch (err) {
      console.log("Error playing audio:", err);
      return;
    }

    // Stop the audio when it reaches the end time
    const stopAudioAt = end;
    const intervalId = setInterval(async () => {
      if (currentAudio && currentAudio.currentTime >= stopAudioAt) {
        clearInterval(intervalId); // Clear the interval function
        if (currentAudio) {
          await currentAudio.pause();
          currentAudio.currentTime = 0;
          currentAudio = null; // Clear the current audio
        }
      }
    }, 10);
  };

  const playEntireAudio = (audioUrl) => {
    currentAudio = new Audio(audioUrl);
    currentAudio.currentTime = 0;
    currentAudio.play();
  };

  const playQuestion = (item) => {
    const text = item.replace(/_+/g, "BLANK");
    let cleanedSentence = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");

    let words = cleanedSentence.split(" ").filter((word) => word);
    let lastWord = words[words.length - 1];

    console.log(item);
    const timestamp = searchWordInTranscript(node.transcript.words, lastWord);
    // if (timestamp.length > 0) {
    playAudioSegment(node.audio_url, 0, timestamp[0].end);
    // } else {
    //   playEntireAudio(node.audio_url); // Pass null or an appropriate value for end timestamp
    // }
  };

  const playThisOption = (labeltext) => {
    const timestamp = searchWordInTranscript(node.transcript.words, labeltext);

    // If the exact match is not found, approximate the timestamp
    if (timestamp.length > 0) {
      playAudioSegment(node.audio_url, timestamp[0].start, timestamp[0].end);
    }
  };

  console.log(node);

  let paragraphs: any = [];
  let optionCounter = 0;

  let fullQ = "";

  node.children.forEach((item) => {
    if (item.type === "paragraph") {
      let renderedChildren = item.children.map((child, index) => {
        console.log(child.bold);
        fullQ += child.text;
        if (child.bold) {
          return <b key={index}>{child.text}</b>;
        } else {
          return child.text;
        }
      });

      paragraphs.push(<p key={item.id}>{renderedChildren}</p>);
    }
  });

  console.log(fullQ);

  return (
    <div>
      <div className="relative mb-3 flex items-start gap-5 p-2">
        <button
          className="group relative flex items-center justify-center rounded-full bg-brand transition duration-200 hover:bg-brand/90 dark:bg-foreground dark:hover:bg-brand"
          style={{
            width: "24px",
            height: "24px",
            minWidth: "24px",
            minHeight: "24px",
            top: "5px",
          }}
          onClick={() => playQuestion(fullQ)}
        >
          <AiFillSound className="play-icon relative left-[1px] h-4 w-4 text-white  group-hover:text-gray-100 dark:text-brand  group-hover:dark:text-foreground" />
        </button>
        <div className="container">
          {paragraphs.map((text, i) => (
            <p key={i} className="mb-2">
              {text}
            </p>
          ))}
        </div>
      </div>
      {node.children.map((item, i) => {
        switch (item.type) {
          case "image":
            return <img src={item.url} width={item.width} />;
          case "option-list-item":
            optionCounter++;
            return (
              <label
                htmlFor={item.id}
                key={i}
                tabIndex={-1}
                className={`
    group mb-3 mt-3 flex cursor-pointer items-center rounded-md border p-2 
    ${
      selectedOption === item.id
        ? "border-brand bg-brand text-white dark:border-foreground dark:bg-gray-300 dark:text-background"
        : "border-gray-700 hover:border-brand hover:bg-transparent hover:text-brand dark:hover:border-foreground dark:hover:bg-accent/50 dark:hover:text-foreground"
    }`}
              >
                <input
                  type="radio"
                  id={item.id}
                  value={item.id}
                  checked={selectedOption === item.id}
                  onChange={handleOptionChange}
                  // disabled={answerChecked}
                  className="ml-1 mr-2 hidden"
                  onClick={() => playThisOption(item.children[0].text)}
                />
                <div
                  className={`
      mr-3 flex h-[28px] w-[28px] items-center justify-center rounded-md border 
      ${
        selectedOption === item.id
          ? "border-white dark:border-gray-700"
          : "border-gray-700 group-hover:border-brand dark:group-hover:border-foreground"
      }`}
                >
                  {String.fromCharCode(65 + optionCounter - 1).toUpperCase()}
                </div>
                {item.children[0].bold ? (
                  <b>{item.children[0].text}</b>
                ) : (
                  item.children[0].text
                )}
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
        // disabled={answerChecked}
      >
        Check
      </Button>
      {answerChecked && (isCorrect ? "Correct" : "Incorrect")}
    </div>
  );
};
