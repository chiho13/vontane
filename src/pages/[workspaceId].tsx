import {
  GetStaticPropsContext,
  type NextPage,
  InferGetStaticPropsType,
  GetStaticPaths,
} from "next";

import React, { useState, useEffect, useRef, useCallback } from "react";

import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "./login";
import { useRouter } from "next/router";
import { WorkspaceContainer } from "@/components/WorkspaceContainer";
import { useUserContext } from "@/contexts/UserContext";
import Layout from "@/components/Layouts/AccountLayout";
// import "react-mirt/dist/css/react-mirt.css";

const Workspace: NextPage = () => {
  const session = useSession();
  const router = useRouter();
  const { profile } = useUserContext();
  const workspaceId = router.query.workspaceId;

  return session ? (
    <Layout profile={profile} currentWorkspaceId={workspaceId}>
      <WorkspaceContainer workspaceId={workspaceId} />
    </Layout>
  ) : (
    <LoginPage />
  );
};

export default Workspace;
