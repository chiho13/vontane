import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  stripe,
  createStripeCustomerIfNeeded,
  fetchProducts,
} from "@/server/lib/stripeHelpers";
import { getURL } from "@/utils/helpers";

export const checkoutRouter = createTRPCRouter({
  fetchProducts: protectedProcedure.query(async ({ ctx }) => {
    const products = await fetchProducts();
    return products;
  }),

  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        price: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { price } = input;

      const supabase = ctx.supabaseServerClient;
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const profile = await ctx.prisma.user.findUnique({
        where: { id: user?.id },
      });
      const customer = await createStripeCustomerIfNeeded(ctx.prisma, {
        id: user?.id || "",
        email: user?.email || "",
        stripe_id: profile?.stripe_id || "",
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        billing_address_collection: "required",
        customer: customer.stripe_id,
        line_items: [
          {
            price: price,
            quantity: 1,
          },
        ],
        mode: "subscription",
        allow_promotion_codes: true,
        subscription_data: {
          trial_from_plan: true,
          metadata: {},
        },
        success_url: `${getURL()}/account?success=true`,
        cancel_url: `${getURL()}/account/upgrade?canceled=true`,
      });

      return { sessionId: session.id };
    }),
});
