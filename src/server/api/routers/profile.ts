import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { supabaseServerClient } = ctx;

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
});
