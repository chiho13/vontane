import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "@/utils/api";
import AudioPlayer from "@/components/AudioPlayer";
import VoiceDropdown from "@/components/VoiceDropdown";
import GenerateButton from "@/components/GenerateButton";

import React, { useState, useEffect, useRef, useCallback } from "react";

import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "./login";
import Layout from "@/components/Layouts/AccountLayout";
import { useRouter } from "next/router";

import styled from "styled-components";

import { DocumentEditor } from "@/components/DocumentEditor";
import TablesExample from "@/components/TableExample";
import { NewColumnProvider } from "@/contexts/NewColumnContext";
import { useUserContext } from "@/contexts/UserContext";
import { workspace } from "@prisma/client";

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

  // const dummyAudioElement = new Audio(
  //   "https://peregrine-samples.s3.amazonaws.com/editor-samples/anny.wav"
  // );

  // const [workspaces, setWorkspaces] = useState<workspace[]>([]);
  // const { data: workspacesData, refetch: refetchWorkspaces } =
  //   api.workspace.getWorkspaces.useQuery({ id: "sdfdsf" }, { enabled: false });

  // useEffect(() => {
  //   if (workspacesData) {
  //     const response = workspacesData.workspaces;

  //     console.log(response);
  //     setWorkspaces(response);
  //   }
  // }, [workspacesData, session]);
  useEffect(() => {
    if (session) {
      // refetchWorkspaces();
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

  const showRightSidebar = JSON.parse(
    localStorage.getItem("showRightSidebar") || "true"
  );

  return (
    <>
      <Layout profile={profile}>
        <div
          className="max-[1400px] relative mx-auto mt-10 px-4"
          style={{
            width: `${1170}px`,
            transition: "right 0.3s ease-in-out",
          }}
        >
          <div className="flex justify-center">
            <div className="block">
              <div
                className="relative z-0  mt-4 block w-full rounded-md  border border-gray-300 bg-white px-2 lg:w-[800px] lg:px-0"
                style={{
                  height: "calc(100vh - 120px)",
                }}
              >
                <div className="mt-3 p-4 ">
                  <div className="   ml-[60px] h-[40px] w-[50%] animate-pulse rounded-lg bg-gray-200"></div>
                  <div className="  ml-[60px] mt-6 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200"></div>
                  <div className="  ml-[60px] mt-2 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200"></div>
                  <div className="  ml-[60px] mt-2 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200"></div>
                  <div className="  ml-[60px] mt-2 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200"></div>

                  <div className="  ml-[60px] mt-6 h-[25px] w-[90%] animate-pulse rounded-md bg-gray-200"></div>
                  <div className="  ml-[60px] mt-2 h-[25px] w-[60%] animate-pulse rounded-md bg-gray-200"></div>
                </div>
              </div>
            </div>
            {showRightSidebar && (
              <>
                <div className="flex h-[680px] items-center">
                  <div
                    className={`hidden w-[22px] opacity-0  transition duration-300 hover:opacity-100 lg:block`}
                  >
                    <div className="mx-auto mt-4 block h-[200px] w-[8px]  cursor-col-resize rounded bg-[#b4b4b4] "></div>
                  </div>
                </div>
                <div
                  className="m-w-full mt-4 hidden grow rounded-md border border-gray-300 bg-white   xl:block"
                  style={{
                    height: "calc(100vh - 120px)",
                    minWidth: "270px",
                    flexBasis: "370px",
                    opacity: 1,
                    transition:
                      "width 0.3s ease-in-out, opacity 0.4s ease-in-out, transform 0.3s ease-in-out",
                  }}
                >
                  <div className="p-4">
                    <div className="mt-2 p-4 ">
                      <div className="  top-5 left-5 h-[40px] w-full animate-pulse rounded-lg bg-gray-200"></div>
                      <div className="  left-5 mt-6 h-[125px] w-full animate-pulse rounded-md bg-gray-200"></div>
                      <div className=" left-5 mt-3 h-[125px] w-full animate-pulse rounded-md bg-gray-200"></div>
                      <div className="  left-5 mt-3 h-[125px] w-full animate-pulse rounded-md bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
