import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { NextPage } from "next";
import { DashboardHeader } from "@/components/AccountSettingsNav/header";

const Profile: NextPage = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push(`/login?next=${encodeURIComponent(router.asPath)}`);
    }
  }, [session, router]);

  return (
    <Layout titlePage="Profile">
      <div className="grid items-start gap-8">
        <DashboardHeader
          heading="Profile"
          text="Manage account and web app settings"
        />
      </div>
    </Layout>
  );
};

export default Profile;
