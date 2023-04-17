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

  async function generateAudio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAudioIsLoading(true);
    setGeneratedAudioElement(null);
    setStatus("");
    setTranscriptionId("");

    texttospeechrefetch();
  }

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
    if (
      selectedVoiceId &&
      enteredText &&
      !(Array.isArray(enteredText) && enteredText.length === 0)
    ) {
      console.log(enteredText);
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

  function extractTextValues(data) {
    function traverse(item) {
      let accumulator = [];

      if (item.type === "paragraph") {
        accumulator.push(
          ...item.children.map(
            (child) => child.text || (child.blank ? "BLANK" : "")
          )
        );
      }

      if (item.type === "equation" && item.altText) {
        accumulator.push(item.altText + ".");
      }

      if (item.type === "mcq") {
        // questionCounter++;
        const question = item.children.find(
          (child) => child.type === "list-item"
        );

        if (question) {
          const questionText = question.children
            .map((child) => {
              if (child.blank) {
                return " BLANK ";
              }
              return child.text;
            })
            .join("");

          if (item.questionNumber) {
            accumulator.push(
              `Question ${item.questionNumber}: ${questionText}`
            );
          }
        }

        const options = item.children.find((child) => child.type === "ol");
        if (options) {
          const pronunciationAlphabet = [
            "Aye",
            "Bee",
            "See",
            "Dee",
            "Ee",
            "Eff",
            "Gee",
            "Aitch",
            "Eye",
            "Jay",
            "Kay",
            "El",
            "Em",
            "En",
            "Oh",
            "Pee",
            "Cue",
            "Ar",
            "Ess",
            "Tee",
            "You",
            "Vee",
            "Double-You",
            "Ex",
            "Why",
            "Zee",
          ];

          options.children.forEach((option, index) => {
            const optionLetter = pronunciationAlphabet[index];
            const isFirstOption = index === 0;
            const isLastOption = index === options.children.length - 1;

            if (isFirstOption) {
              accumulator.push(
                `Is it ${optionLetter}. ${option.children[0].text}.`
              );
            } else if (isLastOption) {
              accumulator.push(
                `or ${optionLetter}. ${option.children[0].text}.`
              );
            } else {
              accumulator.push(`${optionLetter}. ${option.children[0].text}.`);
            }
          });
        }
      }

      if (item.children) {
        item.children.forEach((child) => {
          accumulator.push(...traverse(child));
        });
      }

      return accumulator;
    }

    return traverse({ children: data });
  }

  function handleTextChange(value: any[]) {
    console.log(value);
    const extractedText = extractTextValues(value);
    setEnteredText(extractedText);
    console.log(extractedText);
  }

  return (
    <>
      <Layout profile={profile} workspaces={workspaces}>
        <div className="mx-auto mt-4 justify-center p-4 lg:mt-8">
          <div className=" z-1000 absolute mx-auto lg:w-[980px]  ">
            <div className="relative flex items-center justify-end">
              {/* <label className="text-bold  mb-2 text-sm text-gray-500">
                Text to Speech
              </label> */}
            </div>
          </div>
          <div className="linear-gradient z-0 mx-auto mb-20 mt-20 w-full rounded-md border-2 border-gray-300 px-2 lg:h-[640px]  lg:w-[980px] lg:px-0 ">
            <div className="block  lg:w-full">
              {/* <TablesExample /> */}
              <div className="z-10 mx-auto mb-5 flex items-center lg:absolute lg:w-[980px]">
                <div className="mr-4 flex-1 ">
                  <VoiceDropdown setSelectedVoiceId={setSelectedVoiceId} />
                </div>

                <GenerateButton
                  isDisabled={isDisabled}
                  audioIsLoading={audioIsLoading}
                  onClick={generateAudio}
                />
              </div>
              <NewColumnProvider>
                <DocumentEditor
                  handleTextChange={handleTextChange}
                  initialSlateValue={initialSlateValue}
                />
              </NewColumnProvider>
            </div>
          </div>
        </div>
      </Layout>
      {!audioIsLoading && generatedAudioElement && (
        <div className="fixed bottom-0 left-0 bottom-4 right-0 mx-auto flex w-full justify-center ">
          <div className="w-[94%] flex-shrink-0 lg:w-[500px] ">
            <AudioPlayer
              generatedAudio={generatedAudioElement}
              transcriptionId={transcriptionId}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
