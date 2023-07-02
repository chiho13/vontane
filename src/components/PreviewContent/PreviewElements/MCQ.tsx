import React, { useContext, useState } from "react";
import { CollapsibleAudioPlayer } from "./CollapsibleAudio";
import { Button } from "@/components/ui/button";
import { AudioManagerContext } from "@/contexts/PreviewAudioContext";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { AiFillSound } from "react-icons/ai";
import { extractTextValues } from "@/components/DocumentEditor/helpers/extractText";
function searchWordInTranscript(transcript, searchTerm) {
  let result = [];

  // Split the search term into individual words
  let searchWords = searchTerm.split(" ");

  let i = 0;
  while (i < transcript.length) {
    if (transcript[i].word === searchWords[0]) {
      let found = true;
      for (let j = 1; j < searchWords.length; j++) {
        if (
          i + j >= transcript.length ||
          transcript[i + j].word !== searchWords[j]
        ) {
          found = false;
          break;
        }
      }
      if (found) {
        result.push({
          start: transcript[i].start,
          end: transcript[i + searchWords.length - 1].end,
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

  let currentAudio = null;

  const playAudioSegment = (audioUrl, start, end) => {
    // Stop the current audio if it's playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Create a new Audio object and start playing
    currentAudio = new Audio(audioUrl);
    currentAudio.currentTime = start;
    currentAudio.play();

    // Stop the audio when it reaches the end time
    const stopAudioAt = end;
    const intervalId = setInterval(() => {
      if (currentAudio && currentAudio.currentTime >= stopAudioAt) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null; // Clear the current audio
        clearInterval(intervalId);
      }
    }, 10);
  };

  const getApproximateTimestamp = (text, labeltext) => {
    const words = text.split(" ");
    const startIndex = words.findIndex((word) =>
      word.toLowerCase().includes(labeltext.toLowerCase())
    );

    const start = calculateApproximateStartTime(words, startIndex);
    const end = calculateApproximateEndTime(words, startIndex);
    return { start, end };
  };

  const calculateApproximateStartTime = (words, startIndex) => {
    // Calculate the approximate start time based on word count and average word duration
    const averageWordDuration = node.audio_duration / words.length;
    return startIndex * averageWordDuration;
  };

  const calculateApproximateEndTime = (words, startIndex) => {
    // Calculate the approximate end time based on word count and average word duration
    const averageWordDuration = node.audio_duration / words.length;
    return (startIndex + 1) * averageWordDuration;
  };

  const playQuestion = (item) => {
    const text = item.replace(/_+/g, "BLANK");
    let cleanedSentence = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

    let words = cleanedSentence.split(" ").filter((word) => word);
    let lastWord = words[words.length - 1];

    const timestamp = searchWordInTranscript(node.transcript.words, lastWord);
    playAudioSegment(node.audio_url, 0, timestamp[0].end);
  };

  const playThisOption = (labeltext) => {
    const timestamp = searchWordInTranscript(node.transcript.words, labeltext);

    // If the exact match is not found, approximate the timestamp
    if (!timestamp || timestamp.length === 0) {
      const approximateTimestamp = getApproximateTimestamp(
        node.content,
        labeltext
      );
      playAudioSegment(
        node.audio_url,
        approximateTimestamp.start,
        approximateTimestamp.end
      );
    } else {
      playAudioSegment(node.audio_url, timestamp[0].start, timestamp[0].end);
    }
  };

  console.log(node);
  return (
    <div>
      {node.children.map((item, i) => {
        switch (item.type) {
          case "paragraph":
            return (
              <div className="mb-3 flex items-center p-2">
                <button
                  className="group relative flex items-center justify-center rounded-full bg-brand transition duration-200 hover:bg-brand/90 dark:bg-foreground dark:hover:bg-brand"
                  style={{
                    width: "24px",
                    height: "24px",
                    minWidth: "24px",
                    minHeight: "24px",
                  }}
                  onClick={() => playQuestion(item.children[0].text)}
                >
                  <AiFillSound className="play-icon relative left-[1px] h-4 w-4 text-white  group-hover:text-gray-100 dark:text-brand  group-hover:dark:text-foreground" />
                </button>
                <p className="ml-4 " key={i}>
                  {item.children[0].text}
                </p>
              </div>
            );
          case "option-list-item":
            return (
              <label
                htmlFor={item.id}
                key={i}
                className={`mb-1 mt-1 flex  cursor-pointer items-center rounded-md border border-gray-700 p-2 transition duration-300 hover:border-gray-500 hover:bg-accent/50 ${
                  selectedOption === item.id
                    ? " border-brand bg-brand text-white dark:border-foreground dark:bg-gray-300 dark:text-background "
                    : ""
                }`}
                onClick={() => playThisOption(item.children[0].text)}
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
