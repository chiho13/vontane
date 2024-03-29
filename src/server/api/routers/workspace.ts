import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { Prisma, workspace } from "@prisma/client";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import ytdl from "ytdl-core";

const ee = new EventEmitter();

export const workspaceRouter = createTRPCRouter({
  changeFont: protectedProcedure
    .input(z.object({ id: z.string(), font: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id: input.id },
      });

      if (!workspace) {
        throw new Error("workspace  not found");
      }

      if (ctx.user.id !== workspace.author_id) {
        throw new Error("Unauthorized access");
      }

      // toggle the published status and adjust the published_at date accordingly
      const updatedWorkspace = await ctx.prisma.workspace.update({
        where: { id: input.id },
        data: {
          font_style: input.font,
        },
      });

      return updatedWorkspace;
    }),
  changeBrandColour: protectedProcedure
    .input(z.object({ id: z.string(), brandColor: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id: input.id },
      });

      if (!workspace) {
        throw new Error("workspace  not found");
      }

      if (ctx.user.id !== workspace.author_id) {
        throw new Error("Unauthorized access");
      }

      // toggle the published status and adjust the published_at date accordingly
      const updatedWorkspace = await ctx.prisma.workspace.update({
        where: { id: input.id },
        data: {
          brand_color: input.brandColor,
        },
      });

      return updatedWorkspace;
    }),
  publishWorkspace: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id: input.id },
      });

      if (!workspace) {
        throw new Error("workspace  not found");
      }

      if (ctx.user.id !== workspace.author_id) {
        throw new Error("Unauthorized access");
      }

      // toggle the published status and adjust the published_at date accordingly
      const updatedWorkspace = await ctx.prisma.workspace.update({
        where: { id: input.id },
        data: {
          published: !workspace.published,
          published_at: workspace.published ? null : new Date(),
        },
      });

      return updatedWorkspace;
    }),
  getWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    const activeWorkspaces = await ctx.prisma.workspace.findMany({
      where: { author_id: ctx.user.id, deleted_at: null },
      orderBy: { created_at: "asc" },
    });

    const deletedWorkspaces = await ctx.prisma.workspace.findMany({
      where: {
        author_id: ctx.user.id,
        deleted_at: {
          not: null,
        },
      },
      orderBy: { created_at: "asc" },
    });

    if (!activeWorkspaces) {
      throw new Error("workspace  not found");
    }

    return { workspaces: activeWorkspaces, trash: deletedWorkspaces };
  }),
  getFolderAndWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    const userWithFoldersAndWorkspaces = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        folders: {
          include: {
            workspaces: {
              orderBy: { created_at: "asc" }, // Order workspaces in each folder by created_at in ascending order
            },
          },
        },
        workspaces: {
          where: { folder_id: null, deleted_at: null }, // Include top-level workspaces
          orderBy: { created_at: "asc" },
        },
      },
    });

    return {
      folders: userWithFoldersAndWorkspaces?.folders,
      rootLevelworkspaces: userWithFoldersAndWorkspaces?.workspaces,
    };
  }),
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
  getPublicWorkspace: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id: input.id },
      });

      if (!workspace) {
        throw new Error("workspace  not found");
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
  createWorkspace: protectedProcedure
    .input(z.object({ folder_id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const defaultSlateValue = JSON.stringify([
        {
          id: nanoid(),
          type: "title",
          children: [
            {
              text: "",
            },
          ],
        },
        {
          id: nanoid(),
          type: "paragraph",
          align: "start",
          children: [
            {
              text: "",
            },
          ],
        },
      ]);

      const newFolderId = input.folder_id === "" ? null : input.folder_id;

      const workspace = await ctx.prisma.workspace.create({
        data: {
          author_id: ctx.user.id,
          slate_value: defaultSlateValue,
          folder_id: newFolderId,
        },
      });

      return { workspace };
    }),
  moveWorkspace: protectedProcedure
    .input(z.object({ folder_id: z.string(), workspace_id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id: input.workspace_id },
      });

      if (ctx.user.id !== workspace.author_id) {
        throw new Error("Unauthorized access");
      }

      const newFolderId = input.folder_id === "" ? null : input.folder_id;

      const updatedWorkspace = await ctx.prisma.workspace.update({
        where: { id: input.workspace_id },
        data: {
          folder_id: newFolderId,
        },
      });

      return { workspace: updatedWorkspace };
    }),

  createFolder: protectedProcedure
    .input(z.object({ folder_name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const workspace = await ctx.prisma.folder.create({
        data: {
          owner_id: ctx.user.id,
          name: input.folder_name,
        },
      });

      return { workspace };
    }),
  renameFolder: protectedProcedure
    .input(z.object({ folder_id: z.string(), folder_name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const folder = await ctx.prisma.folder.update({
        where: { id: input.folder_id },
        data: {
          name: input.folder_name,
        },
      });

      return { folder };
    }),
  softDeleteWorkspace: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id },
      });

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (ctx.user.id !== workspace.author_id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized access",
        });
      }

      // Perform the soft delete
      const updatedWorkspace = await ctx.prisma.workspace.update({
        where: { id },
        data: { deleted_at: new Date() },
      });

      return { workspace: updatedWorkspace };
    }),

  softDeleteFolderAndWorkspace: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const folder = await ctx.prisma.folder.findUnique({
        where: { id },
      });

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "folder not found",
        });
      }

      if (ctx.user.id !== folder.owner_id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized access",
        });
      }

      // Perform the soft delete
      const updatedWorkspace = await ctx.prisma.workspace.update({
        where: { id },
        data: { deleted_at: new Date() },
      });

      return { workspace: updatedWorkspace };
    }),
  restoreWorkspace: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const workspace = await ctx.prisma.workspace.findUnique({
        where: { id },
      });

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }

      if (ctx.user.id !== workspace.author_id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized access",
        });
      }

      // Restore the soft deleted workspace
      const updatedWorkspace = await ctx.prisma.workspace.update({
        where: { id },
        data: { deleted_at: null },
      });

      return { workspace: updatedWorkspace };
    }),
  getVideoDetails: protectedProcedure
    .input(z.object({ link: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const info = await ytdl.getInfo(input.link);
        const videoDetails = info.videoDetails;
        return { videoDetails };
      } catch (error) {
        // Handle error accordingly
        console.error(error);
        return { videoDetails: null };
      }
    }),
});
