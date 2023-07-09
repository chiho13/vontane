import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "./login";
import { useRouter } from "next/router";
import { WorkspaceContainer } from "@/components/WorkspaceContainer";
import { useUserContext } from "@/contexts/UserContext";
import Layout from "@/components/Layouts/AccountLayout";
import { NextPage } from "next";

const Workspace: NextPage = () => {
  const session = useSession();
  const router = useRouter();
  const { profile } = useUserContext();
  const workspaceId = router.query.workspaceId as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return <div></div>;
  }

  return session ? (
    <Layout profile={profile} currentWorkspaceId={workspaceId}>
      <WorkspaceContainer workspaceId={workspaceId} />
    </Layout>
  ) : (
    <LoginPage />
  );
};

export default Workspace;
