import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { type NextPage } from "next";
import Head from "next/head";
import { Header } from "@/components/Header";
import React, { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Check } from "lucide-react";
import { api } from "@/utils/api";
import { useTheme } from "styled-components";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { getStripe } from "@/utils/stripe-client";
import LoadingSpinner from "@/icons/LoadingSpinner";
import Layout from "./layout";
import { useUserContext } from "@/contexts/UserContext";
import Link from "next/link";

const PricingStyle = styled.section`
  .upgrade-section {
    margin-top: 100px;
    height: 100vh;
  }
  .subscribe-btn {
    position: absolute;
    bottom: 0;
    overflow: hidden;
    background-image: linear-gradient(to right, #0b89ee, #1371e9);
    transition: all 0.2s ease-in-out;
    display: inline-block;
    padding: 12px 20px;
    text-decoration: none;
    border-radius: 4px;
  }

  .subscribe-btn span {
    position: relative;
    color: white;
  }

  .subscribe-btn::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(to right, #1895f4, #1e79e8);
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  .subscribe-btn:hover::before {
    opacity: 1;
  }
`;

const Upgrade: NextPage = () => {
  const supabase = useSupabaseClient();

  const theme = useTheme();
  const router = useRouter();
  const session = useSession();
  const [loading, setLoading] = useState<boolean>(false);

  const [toggle, setToggle] = useState(true);
  const toggleClass = " transform translate-x-[22px]";
  const queryResult = api.checkout.fetchProducts.useQuery();
  const { data } = queryResult;

  const prices = data && data[0].prices;

  console.log(prices);
  const [selectedPrice, setSelectedPrice] = useState("");
  const { profile, isLoading } = useUserContext();

  useEffect(() => {
    if (prices) {
      if (toggle) {
        setSelectedPrice(prices[1].id);
      } else {
        setSelectedPrice(prices[0].id);
      }
    }
  }, [toggle]);

  useEffect(() => {
    if (profile) {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (prices) {
      setSelectedPrice(prices[1].id);
      console.log(prices[1]);
    }
  }, [prices]);

  const createCheckoutSessionMutation =
    api.checkout.createCheckoutSession.useMutation();

  const createCheckoutSession = async (_price: string) => {
    if (loading) return;
    try {
      setLoading(true);
      const { checkoutUrl } = await createCheckoutSessionMutation.mutateAsync({
        price: _price,
      });

      if (checkoutUrl) {
        void router.push(checkoutUrl);
      }
      setLoading(false);
      // stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      setLoading(false);
      console.error("Error creating checkout session:", error);
    }
  };

  useEffect(() => {
    if (!session) {
      router.push(`/login?next=${encodeURIComponent(router.asPath)}`);
    }
  }, [session, router]);

  const priceVariants = {
    hidden: { opacity: 0, scale: 0.6 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.6 },
  };

  if (isLoading) {
    return (
      <Layout titlePage="Upgrade">
        <div className="container mx-auto mt-10">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto mb-[20px] max-w-[510px] text-center lg:mb-5">
                <h1 className="text-dark mb-4 text-3xl font-bold sm:text-3xl ">
                  <LoadingSpinner />
                </h1>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (profile?.is_subscribed) {
    return (
      <Layout titlePage="Upgrade">
        <div className="container mx-auto mt-10">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto mb-[20px] max-w-[510px] text-center lg:mb-5">
                <h1 className="text-dark mb-4 text-3xl font-bold sm:text-3xl ">
                  Thank you for your subscription
                </h1>

                <p className="mt-4">You have access to all PRO features.</p>
                <p className="mt-4">
                  To manage your subcription go to{" "}
                  <Link
                    href="/account"
                    className="ml-2 rounded-md bg-gray-200 p-2 transition duration-300 hover:bg-gray-300"
                  >
                    <span className="text-bold">Billing</span>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout titlePage="Upgrade">
      <PricingStyle>
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto mb-[20px] max-w-[510px] text-center lg:mb-5">
                <h1 className="text-dark mb-4 text-3xl font-bold sm:text-4xl ">
                  Upgrade
                </h1>
              </div>
            </div>
          </div>

          <div className="relative mt-5 mb-5 flex items-center justify-center gap-5">
            {/*   Switch Container */}
            <span className="flex text-lg font-semibold text-gray-500">
              Monthly
            </span>
            <div
              className="relative flex h-[24px] w-[48px] cursor-pointer items-center  rounded-full border border-[#0E78EF] bg-white p-1"
              onClick={() => {
                setToggle(!toggle);
              }}
            >
              {/* Switch */}
              <div
                className={
                  "absolute left-[2px] h-[20px] w-[20px] transform rounded-full bg-[#0E78EF] shadow-md duration-300 ease-in-out" +
                  (toggle ? null : toggleClass)
                }
              ></div>
            </div>
            <span className="relative flex text-lg font-semibold text-gray-500">
              Annual
              <div className="text-bold absolute left-[70px] w-[80px] rounded-md border border-green-600 bg-[#edf9f1] p-1 text-center text-xs text-green-700">
                Save 38%!
              </div>
            </span>
          </div>
          <div className="relatve -mx-4 mb-10 flex flex-wrap justify-center">
            <div className="w-full px-4 lg:w-[720px]">
              <div className="relative z-10 grid gap-10 overflow-hidden rounded-xl border border-gray-200 bg-white py-10 px-8 shadow-md sm:p-12 lg:grid-cols-2 lg:py-10 lg:px-6 xl:p-10">
                <div className="relative flex flex-col justify-between">
                  <span className="mb-4 block text-[29px] text-lg font-semibold text-[#0E78EF]">
                    Pro Plan{" "}
                  </span>

                  <div className="mb-7">
                    <p className="mt-3  flex items-center text-left text-base font-semibold leading-loose text-gray-500">
                      <Check />
                      <span className="pl-2">
                        <span className="text-[#0E78EF]">Unlimited</span> Docs
                        and Slide Exports
                      </span>
                    </p>
                    <p className="mt-2  flex items-center text-left font-semibold leading-loose text-gray-500">
                      <Check />
                      <span className="pl-2">
                        <span className="text-[#0E78EF]">Unlimited</span> Usage
                        of AI
                      </span>
                    </p>
                    <p className="mt-3 flex items-center text-left font-semibold leading-loose text-gray-500">
                      <Check />
                      <span className="pl-2">
                        <span className="text-[#0E78EF]">Unlimited</span>{" "}
                        Workspaces
                      </span>
                    </p>
                    <p className="mt-3  flex  items-center text-left font-semibold leading-loose text-gray-500">
                      <Check />
                      <span className="pl-2">
                        <span className="text-[#0E78EF]">Priority</span>{" "}
                        customer support
                      </span>
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="relative h-[80px]">
                    <h2 className=" relative mb-5 mt-10  text-[50px] font-bold text-gray-600">
                      <AnimatePresence>
                        {toggle ? (
                          <motion.span
                            className="absolute top-0 left-0 block"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={priceVariants}
                            transition={{ duration: 0.4 }}
                            key="monthly"
                          >
                            £39
                          </motion.span>
                        ) : (
                          <motion.span
                            className="absolute top-0 left-0 block"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={priceVariants}
                            transition={{ duration: 0.4 }}
                            key="annual"
                          >
                            £24
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </h2>
                  </div>
                  <span className="absolute text-[16px] font-medium text-gray-500">
                    {" "}
                    per month{" "}
                  </span>
                  <p className="text-body-color mb-10 mt-10 border-b border-[#F2F2F2]  pb-6  text-base">
                    {toggle ? "(Billed Monthly)" : "(Billed Annually)"}
                  </p>
                  <button
                    onClick={() => createCheckoutSession(selectedPrice)}
                    className="subscribe-btn flex h-[50px] w-full items-center justify-center rounded-md border p-4 text-center text-base font-semibold text-white transition hover:bg-opacity-10"
                  >
                    <div className="flex items-center justify-center">
                      {loading ? (
                        <LoadingSpinner strokeColor="#ffffff" />
                      ) : (
                        <span className="ml-2">Upgrade</span>
                      )}
                    </div>
                  </button>

                  <span className="absolute -right-10 top-0 z-[-1]">
                    <svg
                      width="127"
                      height="222"
                      viewBox="0 0 77 172"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="86"
                        cy="86"
                        r="86"
                        fill="url(#paint0_linear)"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear"
                          x1="86"
                          y1="0"
                          x2="86"
                          y2="172"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#1177EF" stopOpacity="0.22 " />
                          <stop
                            offset="1"
                            stopColor="#01AEF4"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PricingStyle>
    </Layout>
  );
};

export default Upgrade;
