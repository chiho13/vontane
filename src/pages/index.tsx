import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "@/utils/api";
import AudioPlayer from "@/components/AudioPlayer";
import VoiceDropdown from "@/components/VoiceDropdown";
import GenerateButton from "@/components/GenerateButton";

import React, { useState, useEffect, useRef, useCallback } from "react";
import useStatusPolling from "@/hooks/useStatusPolling";

import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "./login";
import Layout from "@/components/Layouts/AccountLayout";
import { useRouter } from "next/router";

import styled from "styled-components";

import { DocumentEditor } from "@/components/DocumentEditor";
import TablesExample from "@/components/TableExample";
import { NewColumnProvider } from "@/contexts/NewColumnContext";
import { useUserContext } from "@/contexts/UserContext";

const TextAreaInputStyle = styled.textarea`
  background: linear-gradient(120deg, #fdfbfb 0%, #f2f6f7 100%);
`;

const Home: NextPage = () => {
  const session = useSession();
  const [selectedVoiceId, setSelectedVoiceId] = React.useState<string>("");

  const [enteredText, setEnteredText] = React.useState<string[]>([]);

  const [audioIsLoading, setAudioIsLoading] = React.useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [transcriptionId, setTranscriptionId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");

  const { profile, workspaces } = useUserContext();
  const router = useRouter();

  const [generatedAudioElement, setGeneratedAudioElement] =
    useStatusPolling(setAudioIsLoading);
  // const dummyAudioElement = new Audio(
  //   "https://peregrine-samples.s3.amazonaws.com/editor-samples/anny.wav"
  // );

  useEffect(() => {
    if (session) {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session && workspaces && workspaces.length > 0) {
      router.push(`/${workspaces[0].id}`);
    }
  }, [workspaces, router, session]);

  const {
    data: texttospeechdata,
    error: texttospeecherror,
    isLoading: texttospeechloading,
    refetch: texttospeechrefetch,
  } = api.texttospeech.startConversion.useQuery(
    { voice: selectedVoiceId, content: enteredText },
    {
      enabled: false,
    }
  );

  const [isDisabled, setIsDisabled] = useState<boolean>(true);

  useEffect(() => {
    console.log(transcriptionId);
  }, [transcriptionId]);

  useEffect(() => {
    if (audioIsLoading && !texttospeechloading) {
      if (texttospeechdata) {
        setTranscriptionId(texttospeechdata.transcriptionId);
        console.log(texttospeechdata);
      }

      if (texttospeecherror) {
        console.error(texttospeecherror);
        // Handle the error as needed
      }
    }
  }, [
    audioIsLoading,
    texttospeechdata,
    texttospeecherror,
    texttospeechloading,
  ]);

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
      <Layout profile={profile} workspaces={workspaces}>
        <div className="mx-auto mt-4 justify-center p-4 lg:mt-8">
          <div className=" z-1000 absolute mx-auto lg:w-[980px]  ">
            <div className="relative flex items-center justify-end"></div>
          </div>
          <div className="linear-gradient z-0 mx-auto mb-20 mt-20 w-full rounded-md border-2 border-gray-300 px-2 lg:h-[640px]  lg:w-[980px] lg:px-0 "></div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
