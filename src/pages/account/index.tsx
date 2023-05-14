import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { NextPage } from "next";
import { DashboardHeader } from "@/components/AccountSettingsNav/header";
import { useUserContext } from "@/contexts/UserContext";
import { freePlan, proPlan } from "@/config/subscription";
import { useTheme } from "styled-components";
import LoadingSpinner from "@/icons/LoadingSpinner";
import Link from "next/link";
import { formatDate } from "@/utils/formatDate";
import { api } from "@/utils/api";
import colors from "tailwindcss/colors";
const Account: NextPage = () => {
  const session = useSession();
  const router = useRouter();

  const theme = useTheme();
  const { profile, isLoading } = useUserContext();

  const plan = profile?.is_subscribed ? proPlan : freePlan;

  const [isPortalLoading, setIsPortalLoading] = useState(false);
  useEffect(() => {
    if (!session) {
      router.push(`/login?next=${encodeURIComponent(router.asPath)}`);
    }
  }, [session, router]);

  const { mutateAsync: createBillingPortalSession } =
    api.checkout.createBillingPortalSession.useMutation();

  const createPortal = async () => {
    setIsPortalLoading(true);
    const { billingPortalUrl } = await createBillingPortalSession();
    if (billingPortalUrl) {
      void router.push(billingPortalUrl);
    } else {
      setIsPortalLoading(false);
    }
  };

  console.log(profile);

  if (isLoading) {
    return (
      <Layout titlePage="Billing">
        <div className="grid items-start gap-8">
          <DashboardHeader
            heading="Billing"
            text="Manage billing and your subscription plan."
          />
        </div>
      </Layout>
    );
  }
  return (
    <Layout titlePage="Billing">
      <div className="grid items-start gap-8">
        <DashboardHeader
          heading="Billing"
          text="Manage billing and your subscription plan."
        />
        <div className="rounded-lg border bg-transparent text-black shadow-sm dark:border-gray-700 lg:w-[80%]">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight dark:text-foreground">
              Subscription Plan
            </h3>

            <p className="text-sm text-gray-500">
              You are currently on the <strong>{plan.name}</strong> plan.
            </p>

            <div className="pt-3 dark:text-foreground"> {plan.description}</div>

            <div className="flex flex flex-col items-start items-center  space-y-2 md:flex-row md:justify-between md:space-x-0">
              {profile?.is_subscribed ? (
                <button
                  disabled={isPortalLoading}
                  onClick={createPortal}
                  className={`disabled:pointer-event-none mr-2 mt-5 inline-flex items-center rounded-lg border border-gray-200 bg-white py-2.5 px-5 text-sm font-medium text-gray-900 transition duration-300 hover:bg-gray-100 hover:text-brand focus:z-10 focus:text-brand focus:ring-1 focus:ring-black  dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white
                ${isPortalLoading ? "pointer-events-none opacity-50" : ""}
                `}
                >
                  {isPortalLoading && (
                    <div className="mr-3">
                      <LoadingSpinner strokeColor="stroke-brand" />
                    </div>
                  )}
                  <span>Manage Subscription</span>
                </button>
              ) : (
                <Link
                  href="/account/upgrade"
                  className={`disabled:pointer-event-none mr-2 mt-5 inline-flex items-center rounded-lg border border-gray-200 bg-white py-2.5 px-5 text-sm font-medium text-gray-900 transition duration-300 hover:bg-gray-100 hover:text-brand focus:z-10 focus:text-brand focus:ring-1 focus:ring-black  dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white
              `}
                >
                  <span>Upgrade</span>
                </Link>
              )}

              {profile?.is_subscribed ? (
                <p className="rounded-full text-sm text-gray-500">
                  Your plan renews on{" "}
                  <span className="font-semibold text-gray-600 dark:text-muted-foreground">
                    {formatDate(profile?.stripeCurrentPeriodEnd.getTime())}.
                  </span>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Account;
