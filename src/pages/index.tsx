import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "@/utils/api";
import AudioPlayer from "@/components/AudioPlayer";
import VoiceDropdown from "@/components/VoiceDropdown";
import GenerateButton from "@/components/GenerateButton";
import { GetServerSideProps } from "next";

import React, { useState, useEffect, useRef, useCallback } from "react";

import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "./login";
import Layout from "@/components/Layouts/AccountLayout";
import { useRouter } from "next/router";

import styled from "styled-components";

import { DocumentEditor } from "@/components/DocumentEditor";
import { NewColumnProvider } from "@/contexts/NewColumnContext";
import { useUserContext } from "@/contexts/UserContext";
import { workspace } from "@prisma/client";
import { EditorSkeleton } from "@/components/Skeletons/editor";
import { createInnerTRPCContext } from "@/server/api/trpc";

const TextAreaInputStyle = styled.textarea`
  background: linear-gradient(120deg, #fdfbfb 0%, #f2f6f7 100%);
`;

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context
) => {
  const { req, res }: any = context;
  const { supabaseServerClient } = createInnerTRPCContext({}, req, res);

  const {
    data: { user },
    error,
  } = await supabaseServerClient.auth.getUser();

  if (error || !user) {
    // If no user, redirect to "/login".
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // If there is a user, return the session and other necessary props.
  return {
    props: { session: user }, // Replace 'user' with your actual session data
  };
};

type HomeProps = {
  session: any; // Replace 'any' with your actual Session type.
};

const Home: NextPage<HomeProps> = ({ session }) => {
  // const session = useSession();
  const [selectedVoiceId, setSelectedVoiceId] = React.useState<string>("");

  const [enteredText, setEnteredText] = React.useState<string[]>([]);

  const [audioIsLoading, setAudioIsLoading] = React.useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [transcriptionId, setTranscriptionId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");

  const { profile, workspaces }: any = useUserContext();
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
      const nextPath = sessionStorage.getItem("next");
      const defaultWorkspaceId = workspaces[0].id;
      const redirectToPath = nextPath
        ? `/${nextPath}`
        : `/${defaultWorkspaceId}`;
      router.push(redirectToPath);
    }
  }, [workspaces, router, session]);

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
      <Layout profile={profile}>
        <EditorSkeleton />
      </Layout>
    </>
  );
};

export default Home;
