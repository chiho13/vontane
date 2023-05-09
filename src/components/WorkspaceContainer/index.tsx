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

  const showRightSidebar = JSON.parse(
    localStorage.getItem("showRightSidebar") || "true"
  );

  if (isLoading) {
    return (
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
                height: "calc(100vh - 90px)",
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
                  height: "calc(100vh - 90px)",
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
