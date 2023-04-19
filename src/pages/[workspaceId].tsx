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
import dynamic from "next/dynamic";
import { prisma } from "@/server/db";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "@/server/api/root";
import superjson from "superjson";
import { createInnerTRPCContext } from "@/server/api/trpc";
import {
  GetServerSideProps,
  NextApiRequest,
  NextApiResponse,
} from "next/types";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { parse } from "cookie";
import { workspace } from "@prisma/client";
const DynamicDocumentEditor = dynamic(
  () => import("@/components/DocumentEditor")
);

const TextAreaInputStyle = styled.textarea`
  background: linear-gradient(120deg, #fdfbfb 0%, #f2f6f7 100%);
`;

type Props = {
  workspaceId: string;
};

// export const getServerSideProps = getServerSidePropsWithContext(
//   async (
//     context: GetStaticPropsContext & {
//       req: NextApiRequest;
//       res: NextApiResponse;
//     }
//   ) => {
//     const helpers = createProxySSGHelpers({
//       router: appRouter,
//       ctx: createInnerTRPCContext({}, context.req, context.res),
//       transformer: superjson, // optional - adds superjson serialization
//     });

//     const workspaceId = context.params?.workspaceId as string;
//     await helpers.workspace.getWorkspace.prefetch({ id: workspaceId });

//     return {
//       props: {
//         trpcState: helpers.dehydrate(),
//         workspaceId,
//       },
//       revalidate: 1,
//     };
//   }
// );

// export const getStaticPaths: GetStaticPaths = async () => {
//   // Fetch all workspace IDs you want to pre-render
//   const workspaces = await prisma.workspace.findMany({
//     select: {
//       id: true,
//     },
//   });

//   // Generate the paths array with the fetched workspace IDs
//   const paths = workspaces.map((workspace) => ({
//     params: { workspaceId: workspace.id },
//   }));

//   // Return the paths object with fallback set to 'blocking'
//   return {
//     paths,
//     fallback: "blocking",
//   };
// };

const Workspace: NextPage = () => {
  const session = useSession();
  const [selectedVoiceId, setSelectedVoiceId] = React.useState<string>("");

  const [enteredText, setEnteredText] = React.useState<string[]>([]);

  const [audioIsLoading, setAudioIsLoading] = React.useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchWorkspaceIsLoading, setFetchWorkspaceIsLoading] = useState(true);

  const [transcriptionId, setTranscriptionId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");

  const { profile } = useUserContext();
  const { setUpdatedWorkspace } = useWorkspaceTitleUpdate();
  const [generatedAudioElement, setGeneratedAudioElement] =
    useStatusPolling(setAudioIsLoading);
  // const dummyAudioElement = new Audio(
  //   "https://peregrine-samples.s3.amazonaws.com/editor-samples/anny.wav"
  // );

  const router = useRouter();
  const workspaceId: string = router.query.workspaceId as string;

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
            setInitialSlateValue(JSON.parse(slateValue));
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
        setInitialSlateValue(JSON.parse(slateValue));
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

  if (fetchWorkspaceIsLoading) {
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
    const extractedText = extractTextValues(value);
    setEnteredText(extractedText);
    updateWorkspace(value);

    setUpdatedWorkspace({ title: value[0].children[0].text, id: workspaceId });
  }

  return (
    <>
      <Layout
        profile={profile}
        currentWorkspaceId={workspaceId}
        // setWorkSpaceId={setWorkSpaceId}
      >
        <div className="mx-auto mt-4 justify-center p-4">
          <div className=" z-1000 absolute mx-auto lg:w-[980px]  ">
            <div className="relative flex items-center justify-end">
              {/* <label className="text-bold  mb-2 text-sm text-gray-500">
                Text to Speech
              </label> */}
            </div>
          </div>
          <div className="linear-gradient z-0 mx-auto mb-20 mt-20 w-full rounded-md border-2 border-gray-300 px-2 lg:h-[640px]  lg:w-[980px] lg:px-0 ">
            <div className="block  lg:w-full">
              {/* <div className="z-10 mx-auto mb-5 flex items-center lg:absolute lg:w-[980px]">
                <div className="mr-4 flex-1 ">
                  <VoiceDropdown setSelectedVoiceId={setSelectedVoiceId} />
                </div>

                <GenerateButton
                  isDisabled={isDisabled}
                  audioIsLoading={audioIsLoading}
                  onClick={generateAudio}
                />
              </div> */}
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

export default Workspace;
