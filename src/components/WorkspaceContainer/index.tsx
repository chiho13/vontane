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

import { useSession } from "@supabase/auth-helpers-react";
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
import debounce from "lodash/debounce";
import { TextSpeechProvider } from "@/contexts/TextSpeechContext";
import { EditorProvider } from "@/contexts/EditorContext";
import LoadingSpinner from "@/icons/LoadingSpinner";
import Skeleton from "@/pages/index";

// import "react-mirt/dist/css/react-mirt.css";
type Props = {
  workspaceId: string;
};

export const WorkspaceContainer = ({ workspaceId }) => {
  const router = useRouter();
  const [selectedVoiceId, setSelectedVoiceId] = React.useState<string>("");

  // const [te, setEnteredText] = React.useState<string[]>([]);
  //   const { setTextSpeech, showMiniToolbar } = useTextSpeech();

  const [audioIsLoading, setAudioIsLoading] = React.useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchWorkspaceIsLoading, setFetchWorkspaceIsLoading] = useState(true);

  const [transcriptionId, setTranscriptionId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");

  const { setUpdatedWorkspace } = useWorkspaceTitleUpdate();

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
      enabled: false,
      cacheTime: 5 * 60 * 1000, // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
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

  useEffect(() => {
    if (router.isReady) {
      refetchWorkspaceData();
      setFetchWorkspaceIsLoading(true);
    }
  }, [workspaceId, router.isReady]);

  const [initialSlateValue, setInitialSlateValue] = useState(null);

  useEffect(() => {
    if (workspaceData) {
      const slateValue = workspaceData.workspace.slate_value;

      if (slateValue) {
        console.log(slateValue);
        const parsedSlateValue = JSON.parse(slateValue);
        setInitialSlateValue(parsedSlateValue);

        setFetchWorkspaceIsLoading(false);
      }
    }

    return () => {
      setInitialSlateValue(null);
    };
  }, [workspaceData]);

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

  if (isLoading) {
    return (
      <div className="mx-auto mt-4 justify-center p-4">
        <div className=" z-1000 absolute mx-auto lg:w-[980px]  ">
          <div className="relative flex items-center justify-end"></div>
        </div>
        <div className="linear-gradient z-0 mx-auto mb-20 mt-20 w-full rounded-md border-2 border-gray-300 px-2 lg:h-[680px]  lg:w-[980px] lg:px-0 "></div>
      </div>
    );
  }

  function handleTextChange(value: any[]) {
    // const extractedText = extractTextValues(value);
    // setTextSpeech(extractedText);
    updateWorkspace(value);
    console.log(value);
    // setInitialSlateValue(value);
    // console.log(extractedText);
    setUpdatedWorkspace({ title: value[0].children[0].text, id: workspaceId });
  }

  return (
    <NewColumnProvider>
      {!fetchWorkspaceIsLoading && initialSlateValue && workspaceId && (
        <EditorProvider key={workspaceId}>
          <TextSpeechProvider key={workspaceId}>
            <DocumentEditor
              key={workspaceId}
              workspaceId={workspaceId}
              handleTextChange={debounce(handleTextChange, 500)}
              initialSlateValue={initialSlateValue}
            />
          </TextSpeechProvider>
        </EditorProvider>
      )}
    </NewColumnProvider>
  );
};
