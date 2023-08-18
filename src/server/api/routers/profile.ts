import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getProfile: publicProcedure.query(async ({ ctx }) => {
    const { supabaseServerClient } = ctx;

    const getUser = await supabaseServerClient.auth.getUser();

    const userId = getUser.data.user.id;
    const profile = await ctx.prisma.user.findUnique({
      where: { id: userId },
    });

    const activeWorkspaces = await ctx.prisma.workspace.findMany({
      where: { author_id: userId, deleted_at: null },
      orderBy: { created_at: "desc" },
    });

    const deletedWorkspaces = await ctx.prisma.workspace.findMany({
      where: {
        author_id: userId,
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
