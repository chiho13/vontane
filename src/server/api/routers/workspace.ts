import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";

export const workspaceRouter = createTRPCRouter({
  getWorkspace: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id: input.id },
      });

      if (!workspace) {
        throw new Error("workspace  not found");
      }

      if (ctx.user.id !== workspace.author_id) {
        throw new Error("Unauthorized access");
      }
      return { workspace };
    }),
});
