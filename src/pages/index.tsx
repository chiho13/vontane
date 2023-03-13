import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "@/utils/api";

import AudioPlayer from "@/components/AudioPlayer";
import VoiceDropdown from "@/components/VoiceDropdown";
import GenerateButton from "@/components/GenerateButton";

import { ttsApi } from "@/api/ttsApi";
import React, { useState, useEffect } from "react";
import useStatusPolling from "@/hooks/useStatusPolling";
import { ThemeProvider } from "styled-components";

interface Theme {
  colors: {
    brand: string;
    white: string;
  };
  background: {
    white: string;
  };
}

const theme: Theme = {
  colors: {
    brand: "#f5820d",
    white: "#ffffff",
  },
  background: {
    white: "linear-gradient(120deg, #fdfbfb 0%, #f2f6f7 100%)",
  },
};

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const [selectedVoiceId, setSelectedVoiceId] = React.useState<string>("");

  const [enteredText, setEnteredText] = React.useState<string>("");

  const [audioIsLoading, setAudioIsLoading] = React.useState<boolean>(false);

  function handleTextChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setEnteredText(event.target.value);
  }

  const [transcriptionId, setTranscriptionId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");

  const [generatedAudioElement, setGeneratedAudioElement] =
    useStatusPolling<HTMLAudioElement>(
      transcriptionId,
      status,
      setStatus,
      setAudioIsLoading
    );

  // const dummyAudioElement = new Audio(
  //   "https://peregrine-samples.s3.amazonaws.com/editor-samples/anny.wav"
  // );

  async function generateAudio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAudioIsLoading(true);
    setGeneratedAudioElement(null);
    setStatus("");
    setTranscriptionId("");

    const requestBody = {
      voice: selectedVoiceId,
      content: [enteredText],
    };

    try {
      const data = await ttsApi(requestBody);
      console.log(data);
      setTranscriptionId(data.transcriptionId);
    } catch (error) {
      console.error(error);
    }
  }

  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (selectedVoiceId && enteredText) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [selectedVoiceId, enteredText]);

  return (
    <>
      <Head>
        <title>Verby </title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen bg-gradient-to-b from-[#f1f1f1] to-[#e9e9e9]">
        <ThemeProvider theme={theme}>
          <div className="container mx-auto mt-10  p-4 ">
            <VoiceDropdown setSelectedVoiceId={setSelectedVoiceId} />

            <form id="text-form">
              <label htmlFor="text" className="mb-2 block">
                Enter text (max. 1000 characters):
              </label>
              <textarea
                id="text"
                name="text"
                rows="8"
                cols="50"
                maxLength="1000"
                className="textarea_input mb-4 block w-full resize-none rounded-md border-2 border-gray-100 p-4 focus:outline-none focus-visible:border-orange-500"
                onChange={handleTextChange}
              ></textarea>
              <GenerateButton
                isDisabled={isDisabled}
                audioIsLoading={audioIsLoading}
                onClick={generateAudio}
              />
            </form>
            <div id="download-container" className="mt-4"></div>
            {!audioIsLoading && generatedAudioElement && (
              // <audio controls src={generatedAudioElement.src} />
              <AudioPlayer
                generatedAudio={generatedAudioElement}
                transcriptionId={transcriptionId}
              />
            )}
            {/* <AudioPlayer generatedAudio={dummyAudioElement} /> */}
            {/* {audioUrl && <DownloadButton audioUrl={audioUrl} />} */}
          </div>
        </ThemeProvider>
      </main>
    </>
  );
};

export default Home;
