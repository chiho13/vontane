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

import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "./login";
import Layout from "@/components/Layouts/AccountLayout";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  const session = useSession();
  const [selectedVoiceId, setSelectedVoiceId] = React.useState<string>("");

  const [enteredText, setEnteredText] = React.useState<string>("");

  const [audioIsLoading, setAudioIsLoading] = React.useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    if (session) {
      setLoading(false);
    }
  }, [session]);

  console.log(session);

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

  useEffect(() => {
    return () => setLoading(false);
  }, []);

  if (loading) {
    return <div></div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <>
      <Layout user={session.user.user_metadata}>
        {/* {!session ?? <Link href="/login">Login</Link>} */}
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
      </Layout>
    </>
  );
};

export default Home;
