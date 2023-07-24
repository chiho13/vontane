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
import { useUserContext } from "@/contexts/UserContext";
import Link from "next/link";

const PricingStyle = styled.section`
  .upgrade-section {
    margin-top: 100px;
  }
  .subscribe-btn {
    position: absolute;
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
    border-radius: 4px;
  }

  .subscribe-btn:hover::before {
    opacity: 1;
  }
`;

const Upgrade = () => {
  const supabase = useSupabaseClient();

  const theme = useTheme();
  const router = useRouter();
  const session = useSession();
  const [loading, setLoading] = useState(null);

  const [toggle, setToggle] = useState(true);
  const toggleClass = " transform translate-x-[22px]";
  //   const queryResult = api.checkout.fetchProducts.useQuery();
  //   const { data } = queryResult;

  //   const prices = data && data;

  const [selectedPrice, setSelectedPrice] = useState("");
  const { profile, isLoading }: any = useUserContext();

  useEffect(() => {
    if (profile) {
      setLoading(false);
    }
  }, [profile]);

  const createCheckoutSessionMutation =
    api.checkout.createCheckoutSession.useMutation();

  const createCheckoutSession = async (_price: string) => {
    if (loading) return;
    try {
      setLoading({
        [_price]: true,
      });
      const { checkoutUrl } = await createCheckoutSessionMutation.mutateAsync({
        price: _price,
      });

      if (checkoutUrl) {
        void router.push(checkoutUrl);
      }
      setLoading({});
      // stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      setLoading({});
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

  console.log(profile?.is_subscribed);
  const PriceCards = [
    {
      credits: "25,000 credits",
      price: "9",
      audioTime: "~ 30 minutes of Audio",
      checkoutId: "price_1NX6HtGj8eKfeqgl2PoJ7aOd",
    },
    {
      credits: "7-day Pass",
      price: "39",
      audioTime: "Unlimited",
      checkoutId: "price_1NX6kZGj8eKfeqglc8U3gFRc",
    },
    {
      credits: "30-day Pass",
      price: "99",
      audioTime: "Unlimited",
      checkoutId: "price_1NX6kzGj8eKfeqglERCZRSZf",
      extra: "Priority Support",
    },
  ];

  const PriceCard = ({
    credits,
    price,
    audioTime,
    checkoutId,
    extra,
    loading,
    createCheckoutSession,
  }) => {
    return (
      <div className="relative z-10 flex flex-col rounded-xl  border border-gray-200 bg-white px-8 py-10 shadow-md  dark:bg-secondary sm:p-12 lg:grid-cols-2 lg:px-6 lg:py-10 xl:p-10">
        <div className="relative grow ">
          <span className="mb-2 block  text-[28px] text-lg font-semibold text-[#0E78EF] dark:text-foreground">
            {credits}
          </span>

          <div className="relative">
            <h2 className=" relative mb-2 mt-3  flex text-[40px] font-bold text-gray-500  dark:text-foreground  ">
              £<span className="block text-foreground">{price}</span>
            </h2>
          </div>
          <div className="relative mb-7 block">
            <p className="mt-3  flex items-center text-left text-base font-semibold leading-loose text-gray-500 dark:text-gray-400">
              <Check />
              <span className="shrink pl-2 text-brand">{audioTime}</span>
            </p>
            <p className="mt-2  flex items-center text-left font-semibold leading-loose text-gray-500  dark:text-gray-400">
              <Check />
              <span className="pl-2">One time payment</span>
            </p>

            <p className="mt-3 flex items-center text-left  font-semibold  leading-loose text-gray-500 dark:text-gray-400">
              <Check />
              <span className="pl-2">No subscription</span>
            </p>
            {extra && (
              <p className="mt-3 flex items-center text-left  font-semibold  leading-loose text-gray-500 dark:text-gray-400">
                <Check />
                <span className="pl-2">{extra}</span>
              </p>
            )}
          </div>
        </div>
        <div className="relative h-[50px]">
          <button
            onClick={() => createCheckoutSession(checkoutId)}
            className="subscribe-btn flex w-full items-center justify-center rounded-md border p-2 text-center text-base font-semibold text-white transition"
          >
            <div className="flex items-center justify-center">
              {loading ? (
                <LoadingSpinner strokeColor="stroke-white" />
              ) : (
                <span className="ml-2 text-lg">Buy</span>
              )}
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <PricingStyle>
      <div className="container mx-auto">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto mb-[20px] mt-10 max-w-[510px] text-center lg:mb-5">
              <h1 className="mb-4 text-3xl font-bold text-dark dark:text-foreground sm:text-4xl ">
                Ultra-Realistic Voices
              </h1>
            </div>
          </div>
        </div>
        <div className="relative -mx-4 mb-10 flex justify-center px-10">
          <div className="grid w-full grid-cols-3 gap-2">
            {PriceCards.map((card, index) => (
              <PriceCard
                key={index}
                credits={card.credits}
                price={card.price}
                audioTime={card.audioTime}
                checkoutId={card.checkoutId}
                extra={card.extra}
                loading={loading}
                createCheckoutSession={createCheckoutSession}
              />
            ))}
          </div>
        </div>
      </div>
    </PricingStyle>
  );
};

export default Upgrade;
