import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { NextPage } from "next";
import { DashboardHeader } from "@/components/AccountSettingsNav/header";

const Settings: NextPage = () => {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push(`/login?next=${encodeURIComponent(router.asPath)}`);
    }
  }, [session, router]);

  return (
    <Layout titlePage="Settings">
      <div className=" ml-4 grid items-start gap-8 lg:ml-0">
        <DashboardHeader
          heading="Settings"
          text="Manage account and web app settings"
        />
        <div className="w-[90%] rounded-lg border bg-white text-black shadow-sm lg:w-[50%]">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              Display
            </h3>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
