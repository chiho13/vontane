import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { createStripeCustomerIfNeeded } from "@/server/lib/createStripeCustomer";

export const profileRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const profile = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      const workspaces = await ctx.prisma.workspace.findMany({
        where: { author_id: input.id },
        orderBy: { created_at: "desc" },
      });

      if (!profile) {
        throw new Error("Profile not found");
      }
      if (!workspaces) {
        throw new Error("workspace  not found");
      }
      return { profile, workspaces };
    }),
  handleGoogleOAuthLogin: protectedProcedure
    .input(z.object({ user: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { user } = input;
      const existingUser = await ctx.prisma.user.findUnique({
        where: { id: user },
      });

      // Update the existing user with Stripe customer ID if it doesn't have one
      const updatedUser = await createStripeCustomerIfNeeded(
        ctx.prisma,
        existingUser
      );
      return updatedUser;
    }),
});
