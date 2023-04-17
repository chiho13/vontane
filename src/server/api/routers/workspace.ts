import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { Prisma, workspace } from "@prisma/client";

const ee = new EventEmitter();

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

  updateWorkspace: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        slate_value: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, slate_value } = input;

      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id },
      });

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      if (ctx.user.id !== workspace.author_id) {
        throw new Error("Unauthorized access");
      }

      const updatedWorkspace = await ctx.prisma.workspace.update({
        where: { id },
        data: { slate_value },
      });

      // Emit an event with the updated workspace data
      ee.emit("workspaceUpdated", updatedWorkspace);

      return { workspace: updatedWorkspace };
    }),
  onWorkspaceUpdate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .subscription(async ({ input, ctx }) => {
      return observable<{ workspace: workspace }>((emit) => {
        const onWorkspaceUpdate = (updatedWorkspace: workspace) => {
          if (updatedWorkspace.id === input.id) {
            emit.next({ workspace: updatedWorkspace });
          }
        };

        ee.on("workspaceUpdated", onWorkspaceUpdate);

        return () => {
          ee.off("workspaceUpdated", onWorkspaceUpdate);
        };
      });
    }),
});
