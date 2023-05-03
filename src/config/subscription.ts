import { SubscriptionPlan } from "@/types";
import { env } from "@/env.mjs";

export const freePlan: SubscriptionPlan = {
  name: "Free",
  description:
    "The free plan is limited to 3 workspaces. Upgrade to the PRO plan for unlimited workspaces.",
  stripePriceId: "",
};

export const proPlan: SubscriptionPlan = {
  name: "PRO",
  description: "The PRO plan has unlimited workspaces and premium features.",
  stripePriceId: "",
};
