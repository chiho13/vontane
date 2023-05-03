import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createStripeCustomerIfNeeded,
  fetchProducts,
} from "@/server/stripe/stripe-webhook-handlers";
import { getURL } from "@/utils/helpers";
import { env } from "@/env.mjs";

export const checkoutRouter = createTRPCRouter({
  fetchProducts: protectedProcedure.query(async ({ ctx }) => {
    const { stripe } = ctx;
    const products = await fetchProducts({ stripe });
    return products;
  }),

  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        price: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { stripe, supabaseServerClient, prisma, req } = ctx;
      const { price } = input;

      const supabase = supabaseServerClient;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // const profile = await ctx.prisma.user.findUnique({
      //   where: { id: user?.id },
      // });
      const customerId = await createStripeCustomerIfNeeded({
        stripe,
        prisma,
        userId: user?.id as string,
      });

      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        billing_address_collection: "required",
        customer: customerId,
        client_reference_id: user?.id,
        line_items: [
          {
            price: price,
            quantity: 1,
          },
        ],
        mode: "subscription",
        allow_promotion_codes: true,
        subscription_data: {
          trial_from_plan: false,
          metadata: {},
        },
        success_url: `${getURL()}/account/upgrade?success=true`,
        cancel_url: `${getURL()}/account/upgrade?canceled=true`,
      });

      return { checkoutUrl: checkoutSession.url };
    }),
  createBillingPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const { stripe, prisma, supabaseServerClient, req } = ctx;

    const {
      data: { user },
    } = await supabaseServerClient.auth.getUser();

    const profile = await ctx.prisma.user.findUnique({
      where: { id: user?.id },
    });
    const baseUrl =
      env.NODE_ENV === "development"
        ? `http://${req.headers.host ?? "localhost:3000"}`
        : `https://${req.headers.host ?? env.NEXTAUTH_URL}`;

    const stripeBillingPortalSession =
      await stripe.billingPortal.sessions.create({
        customer: profile?.stripe_id as string,
        return_url: `${baseUrl}/account`,
      });

    if (!stripeBillingPortalSession) {
      throw new Error("Could not create billing portal session");
    }

    return { billingPortalUrl: stripeBillingPortalSession.url };
  }),
});
