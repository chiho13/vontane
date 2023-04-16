import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getProfile: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const profile = await ctx.prisma.user.findUnique({
        where: { id: input.id },
      });

      const workspaces = await ctx.prisma.workspace.findMany({
        where: { author_id: input.id },
        select: { id: true, name: true },
      });
      if (!profile) {
        throw new Error("Profile not found");
      }
      if (!workspaces) {
        throw new Error("workspace  not found");
      }
      return { profile, workspaces };
    }),
});
