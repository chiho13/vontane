import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { WorkspaceContainer } from "@/components/WorkspaceContainer";
import { useUserContext } from "@/contexts/UserContext";
import Layout from "@/components/Layouts/AccountLayout";
import { NextPage } from "next";
import { GetServerSideProps } from "next";
import { createInnerTRPCContext } from "@/server/api/trpc";

type WorkspaceProps = {
  session: any; // Replace 'any' with your actual Session type.
};

const Workspace: NextPage<WorkspaceProps> = ({ session }) => {
  const router = useRouter();

  const workspaceId = router.query.workspaceId as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && loading) {
      setLoading(false);
    }
  }, [session]);

  if (loading) {
    return <div></div>;
  }

  return session ? (
    <WorkspaceContainer workspaceId={workspaceId} />
  ) : (
    <div></div>
  );
};

export const getServerSideProps: GetServerSideProps<WorkspaceProps> = async (
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
        destination: `/login?next=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  // If there is a user, return the session and other necessary props.
  return {
    props: { session: user }, // Replace 'user' with your actual session data
  };
};

export default Workspace;
