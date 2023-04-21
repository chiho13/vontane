import {
  GetStaticPropsContext,
  type NextPage,
  InferGetStaticPropsType,
  GetStaticPaths,
} from "next";
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

import styled from "styled-components";
import { useWorkspaceTitleUpdate } from "@/contexts/WorkspaceTitleContext";
import { DocumentEditor } from "@/components/DocumentEditor";
import TablesExample from "@/components/TableExample";
import { NewColumnProvider } from "@/contexts/NewColumnContext";
import { useUserContext } from "@/contexts/UserContext";
import { useRouter } from "next/router";
import { TextSpeech } from "@/components/TextSpeech";
import { useTextSpeech } from "@/contexts/TextSpeechContext";
import { Mirt } from "@/plugins/audioTrimmer";
// import "react-mirt/dist/css/react-mirt.css";
type Props = {
  workspaceId: string;
};

const useDownloadFile = (url, fileName) => {
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      const response = await fetch(url);
      const data = await response.blob();
      const file = new File([data], fileName, { type: data.type });
      setFile(file);
    };

    fetchFile();
  }, [url, fileName]);

  return file;
};

const Workspace: NextPage = () => {
  const session = useSession();
  const [selectedVoiceId, setSelectedVoiceId] = React.useState<string>("");

  // const [te, setEnteredText] = React.useState<string[]>([]);
  const { setTextSpeech } = useTextSpeech();

  const [audioIsLoading, setAudioIsLoading] = React.useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchWorkspaceIsLoading, setFetchWorkspaceIsLoading] = useState(true);

  const [transcriptionId, setTranscriptionId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");

  const { profile } = useUserContext();
  const { setUpdatedWorkspace } = useWorkspaceTitleUpdate();

  const url =
    "https://res.cloudinary.com/monkeyking/video/upload/v1682090997/synthesised-audio_12_qvb3p4.wav";
  const fileName = "anny.wav";
  const file = useDownloadFile(url, fileName);
  // const dummyAudioElement = new Audio(
  //   "https://peregrine-samples.s3.amazonaws.com/editor-samples/anny.wav"
  // );

  const router = useRouter();
  const workspaceId = router.query.workspaceId;

  //   const [workspaceId, setWorkSpaceId] = useState(router.query.workspaceId);
  const {
    data: workspaceData,
    refetch: refetchWorkspaceData,
    isLoading,
  } = api.workspace.getWorkspace.useQuery(
    {
      id: workspaceId || "",
    },
    {
      enabled: !!workspaceId,
    }
  );

  api.workspace.onWorkspaceUpdate.useSubscription(
    { id: workspaceId },
    {
      next: (data) => {
        if (data.workspace) {
          const slateValue = data.workspace.slate_value;
          if (slateValue) {
            const parsedSlateValue = JSON.parse(slateValue);
            setInitialSlateValue(parsedSlateValue);
          }
        }
      },
      error: (err) => console.error("Error in subscription:", err),
    }
  );

  //   useEffect(() => {
  //     refetchWorkspaceData();
  //     console.log(workspaceId);
  //   }, [router.isReady]);

  const [initialSlateValue, setInitialSlateValue] = useState(null);

  useEffect(() => {
    if (workspaceData) {
      const slateValue = workspaceData.workspace.slate_value;

      if (slateValue) {
        const parsedSlateValue = JSON.parse(slateValue);
        setInitialSlateValue(parsedSlateValue);

        const extractedText: [string] = extractTextValues(parsedSlateValue);
        setTextSpeech(extractedText);
        setFetchWorkspaceIsLoading(false);
      }
    }

    return () => {
      setInitialSlateValue(null);
    };
  }, [workspaceData]);

  useEffect(() => {
    if (session) {
      setLoading(false);
    }
  }, [session]);

  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const updateWorkspaceMutation = api.workspace.updateWorkspace.useMutation();

  const updateWorkspace = async (newSlateValue: any) => {
    try {
      await updateWorkspaceMutation.mutateAsync({
        id: workspaceId,
        slate_value: JSON.stringify(newSlateValue),
      });
    } catch (error) {
      console.error("Error updating workspace:", error);
    }
  };

  useEffect(() => {
    return () => setLoading(false);
  }, []);

  if (loading) {
    return <div></div>;
  }

  if (fetchWorkspaceIsLoading) {
    return <div></div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  function extractTextValues(data) {
    function traverse(item) {
      let accumulator = [];

      if (item.type === "title") {
        accumulator.push(...item.children.map((child) => `${child.text}.`));
      }

      if (item.type === "paragraph") {
        accumulator.push(
          ...item.children.map((child) => {
            let text = child.text || (child.blank ? "BLANK" : "");

            // Replace % with " percent"
            text = text.replace(/%/g, " percent");

            return text;
          })
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
    const extractedText = extractTextValues(value);
    setTextSpeech(extractedText);
    updateWorkspace(value);
    setInitialSlateValue(value);

    setUpdatedWorkspace({ title: value[0].children[0].text, id: workspaceId });
  }

  return (
    <>
      <Layout profile={profile} currentWorkspaceId={workspaceId}>
        <div className="mx-auto mt-4 justify-center p-4">
          <TextSpeech />
          <Mirt file={file} />
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="linear-gradient z-0 mx-auto mb-20 mt-2 w-full rounded-md border-2 border-gray-300 px-2 lg:h-[640px]  lg:w-[980px] lg:px-0 ">
            <div className="block  lg:w-full">
              <NewColumnProvider>
                {!fetchWorkspaceIsLoading &&
                  initialSlateValue &&
                  workspaceId && (
                    <DocumentEditor
                      key={workspaceId}
                      workspaceId={workspaceId}
                      handleTextChange={handleTextChange}
                      initialSlateValue={initialSlateValue}
                    />
                  )}
              </NewColumnProvider>
            </div>
          </div>
        </div>
      </Layout>
      {/* {!audioIsLoading && generatedAudioElement && (
        <div className="fixed bottom-0 left-0 bottom-4 right-0 mx-auto flex w-full justify-center ">
          <div className="w-[94%] flex-shrink-0 lg:w-[500px] ">
            <AudioPlayer
              generatedAudio={generatedAudioElement}
              transcriptionId={transcriptionId}
            />
          </div>
        </div>
      )} */}
    </>
  );
};

export default Workspace;
