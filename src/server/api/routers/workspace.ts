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
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";
import puppeteer from "puppeteer";

const ee = new EventEmitter();

export const workspaceRouter = createTRPCRouter({
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
  createWorkspace: protectedProcedure.mutation(async ({ ctx }) => {
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

    const workspace = await ctx.prisma.workspace.create({
      data: {
        author_id: ctx.user.id,
        slate_value: defaultSlateValue,
      },
    });

    return { workspace };
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
  generatePDF: protectedProcedure
    .input(z.object({ html: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const browser = await puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BLESS_TOKEN}`,
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setContent(input.html);
      await page.waitForSelector(".katex"); // Wait for KaTeX to load

      const pdf = await page.pdf();

      await browser.close();

      // Convert PDF buffer to a base64 string if you want to return it directly
      const pdfBase64 = pdf.toString("base64");

      return { pdf: pdfBase64 };
    }),
});
