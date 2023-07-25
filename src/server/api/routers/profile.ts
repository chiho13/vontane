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

      const activeWorkspaces = await ctx.prisma.workspace.findMany({
        where: { author_id: input.id, deleted_at: null },
        orderBy: { created_at: "desc" },
      });

      const deletedWorkspaces = await ctx.prisma.workspace.findMany({
        where: {
          author_id: input.id,
          deleted_at: {
            not: null,
          },
        },
        orderBy: { created_at: "desc" },
      });

      if (!profile) {
        throw new Error("Profile not found");
      }
      if (!activeWorkspaces) {
        throw new Error("workspace  not found");
      }
      return {
        profile,
        workspaces: activeWorkspaces,
        trash: deletedWorkspaces,
      };
    }),
});
