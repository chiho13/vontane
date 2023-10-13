import { api } from "@/utils/api";

import React, { useState, useEffect, useRef, useCallback } from "react";

import styled from "styled-components";
import { useWorkspaceTitleUpdate } from "@/contexts/WorkspaceTitleContext";
import { DocumentEditor } from "@/components/DocumentEditor";
import { NewColumnProvider } from "@/contexts/NewColumnContext";

import { useRouter } from "next/router";
import { Mirt } from "@/plugins/audioTrimmer";
import { RightSideBarProvider } from "@/contexts/TextSpeechContext";
import { EditorProvider } from "@/contexts/EditorContext";
import { EditorSkeleton } from "../Skeletons/editor";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUserContext } from "@/contexts/UserContext";
import { supabaseClient } from "@/utils/supabaseClient";
import { Button } from "../ui/button";
import Layout from "../Layouts/AccountLayout";
import { ThemeProvider } from "styled-components";
import { debounce } from "lodash";

// import "react-mirt/dist/css/react-mirt.css";
type WorkspaceProps = {
  workspaceId: string;
};

export const WorkspaceContainer: React.FC<WorkspaceProps> = ({
  workspaceId,
}) => {
  const router = useRouter();
  const paymentSuccess = Boolean(router.query.success);
  const [fetchWorkspaceIsLoading, setFetchWorkspaceIsLoading] = useState(true);

  const { setUpdatedWorkspace } = useWorkspaceTitleUpdate();
  const { profile, credits }: any = useUserContext();

  const [open, setOpen] = useState(true);
  //   const [workspaceId, setWorkSpaceId] = useState(router.query.workspaceId);

  const [currentTheme, setCurrentTheme] = useState({
    brandColor: "#0E78EF", // initial default value
    accentColor: "#e9e9e9",
  });

  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced">(
    "idle"
  );
  const {
    data: workspaceData,
    refetch: refetchWorkspaceData,
    error,
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
  const [isTrashed, setIsTrashed] = useState(false);

  useEffect(() => {
    if (workspaceData) {
      const slateValue = workspaceData.workspace.slate_value;
      if (slateValue) {
        const parsedSlateValue = JSON.parse(slateValue);
        setInitialSlateValue(parsedSlateValue);
        setFetchWorkspaceIsLoading(false);
        setSyncStatus("synced");
        setIsTrashed(false);
      }

      setCurrentTheme({
        brandColor: workspaceData.workspace.brand_color || "#0E78EF",
        accentColor: workspaceData.workspace.accent_color || "f1f1f1",
      });

      if (workspaceData.workspace.deleted_at) {
        setIsTrashed(true);
      }
    }

    return () => {
      setInitialSlateValue(null);
    };
  }, [workspaceData]);

  const theme = {
    brandColor: workspaceData?.workspace?.brand_color || "#defaultColor", // default to a safe color if brand_color doesn't exist
  };

  const updateWorkspaceMutation = api.workspace.updateWorkspace.useMutation();

  const updateWorkspace = async (newSlateValue: any) => {
    try {
      await updateWorkspaceMutation.mutateAsync({
        id: workspaceId,
        slate_value: JSON.stringify(newSlateValue),
      });

      setSyncStatus("synced"); // Syncing is complete
    } catch (error) {
      setSyncStatus("idle"); // Reset to idle if there's an error
      console.error("Error updating workspace:", error);
    }
  };

  const debouncedUpdate = useCallback(
    debounce((value: any[]) => {
      updateWorkspace(value);
      setUpdatedWorkspace({
        title: value[0].children[0].text,
        id: workspaceId,
      });
    }, 200),
    [updateWorkspace, setUpdatedWorkspace, workspaceId]
  );

  const handleTextChange = useCallback(
    (value: any[]) => {
      updateWorkspace(value);
      setUpdatedWorkspace({
        title: value[0].children[0].text,
        id: workspaceId,
      });
    },
    [updateWorkspace, setUpdatedWorkspace, workspaceId]
  );

  if (isLoading) {
    return (
      <Layout
        profile={profile}
        currentWorkspaceId={workspaceId}
        refetchWorkspaceData={refetchWorkspaceData}
        isTrashed={isTrashed}
      >
        <EditorSkeleton />;
      </Layout>
    );
  }

  if (error) {
    // Show 404 page if workspaceId is not found
    return (
      <div className="flex h-[100vh] w-full flex-col items-center justify-center">
        <div className="text-bold mb-2 text-6xl">404</div>
        <p className="text-2xl">Workspace not found</p>
      </div>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <Layout
        profile={profile}
        currentWorkspaceId={workspaceId}
        refetchWorkspaceData={refetchWorkspaceData}
        isTrashed={isTrashed}
      >
        <NewColumnProvider>
          {!fetchWorkspaceIsLoading && initialSlateValue && workspaceId && (
            <EditorProvider key={workspaceId}>
              <RightSideBarProvider
                key={workspaceId}
                workspaceData={workspaceData}
                refetchWorkspaceData={refetchWorkspaceData}
              >
                <DocumentEditor
                  key={workspaceId}
                  setSyncStatus={setSyncStatus}
                  syncStatus={syncStatus}
                  workspaceId={workspaceId}
                  credits={credits}
                  handleTextChange={handleTextChange}
                  initialSlateValue={initialSlateValue}
                  setFetchWorkspaceIsLoading={setFetchWorkspaceIsLoading}
                />
                <AlertDialog open={open && paymentSuccess}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Payment Successful!</AlertDialogTitle>
                      <AlertDialogDescription className="text-md">
                        New Credit Balance: {profile?.credits}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogAction
                        onClick={() => {
                          setOpen(false);
                          router.push(`/docs/${workspaceId}`);
                        }}
                      >
                        OK
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </RightSideBarProvider>
            </EditorProvider>
          )}
        </NewColumnProvider>
      </Layout>
    </ThemeProvider>
  );
};
