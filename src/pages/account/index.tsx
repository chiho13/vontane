import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { WorkspaceContainer } from "@/components/WorkspaceContainer";
import { useUserContext } from "@/contexts/UserContext";
import Layout from "./layout";
import { NextPage } from "next";
import { DashboardHeader } from "@/components/AccountSettingsNav/header";

const Account: NextPage = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push(`/login?next=${encodeURIComponent(router.asPath)}`);
    }
  }, [session, router]);

  return (
    <Layout>
      <div className="grid items-start gap-8">
        <DashboardHeader
          heading="Billing"
          text="Manage billing and your subscription plan."
        />
      </div>
    </Layout>
  );
};

export default Account;
