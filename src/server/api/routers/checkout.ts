import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { createStripeCustomerIfNeeded } from "@/server/lib/createStripeCustomer";

export const checkoutRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const profile = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });
    }),
});
