import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  createStripeCustomerIfNeeded,
  fetchProducts,
} from "@/server/stripe/stripe-webhook-handlers";
import { getURL } from "@/utils/helpers";

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
});
