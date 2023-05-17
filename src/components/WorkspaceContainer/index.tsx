import {
  GetStaticPropsContext,
  type NextPage,
  InferGetStaticPropsType,
  GetStaticPaths,
} from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "@/utils/api";

import React, { useState, useEffect, useRef, useCallback } from "react";

import styled from "styled-components";
import { useWorkspaceTitleUpdate } from "@/contexts/WorkspaceTitleContext";
import { DocumentEditor } from "@/components/DocumentEditor";
import TablesExample from "@/components/TableExample";
import { NewColumnProvider } from "@/contexts/NewColumnContext";

import { useRouter } from "next/router";
import { Mirt } from "@/plugins/audioTrimmer";
import debounce from "lodash/debounce";
import { TextSpeechProvider } from "@/contexts/TextSpeechContext";
import { EditorProvider } from "@/contexts/EditorContext";
import { EditorSkeleton } from "../Skeletons/editor";

// import "react-mirt/dist/css/react-mirt.css";
type WorkspaceProps = {
  workspaceId: string | string[];
};

export const WorkspaceContainer: React.FC<WorkspaceProps> = ({
  workspaceId,
}) => {
  const router = useRouter();
  const [fetchWorkspaceIsLoading, setFetchWorkspaceIsLoading] = useState(true);

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

  if (isLoading) {
    return <EditorSkeleton />;
  }

  function handleTextChange(value: any[]) {
    // const extractedText = extractTextValues(value);
    // setTextSpeech(extractedText);
    updateWorkspace(value);

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
              setFetchWorkspaceIsLoading={setFetchWorkspaceIsLoading}
            />
          </TextSpeechProvider>
        </EditorProvider>
      )}
    </NewColumnProvider>
  );
};
