import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { uploadAudioToSupabase } from "@/server/lib/uploadAudio";

const secretkey = process.env.PLAYHT_SECRETKEY;
const userId = process.env.PLAYHT_USERID;

export const texttospeechRouter = createTRPCRouter({
  getVoices: protectedProcedure.query(async () => {
    const url = "https://play.ht/api/v1/getVoices?ultra=true";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: secretkey!,
          "X-User-ID": userId!,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
      });
    }
  }),
  startConversion: protectedProcedure
    .input(
      z.object({
        voice: z.string(),
        content: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      const url = "https://play.ht/api/v1/convert";
      const { voice, content } = input;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: secretkey!,
            "X-User-ID": userId!,
          },
          body: JSON.stringify({ voice, content }),
        });

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
  uploadAudio: protectedProcedure
    .input(
      z.object({
        audioURL: z.string(),
        fileName: z.string(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabaseServerClient } = ctx;
      const { audioURL, fileName, workspaceId } = input;

      try {
        const uploadedUrl = await uploadAudioToSupabase(
          ctx.prisma,
          supabaseServerClient,
          audioURL,
          fileName,
          workspaceId
        );
        return { url: uploadedUrl, fileName };

        // const tts = await ctx.prisma.texttospeech.create({
        //   data: {
        //     file_name: fileName,
        //     creator_id: ctx.user.id,
        //     workspace_id: workspaceId,
        //   },
        // });

        // return { tts };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
  getTextToSpeechFileNames: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { workspaceId } = input;

      try {
        const fileNames = await ctx.prisma.texttospeech.findMany({
          where: {
            workspace_id: workspaceId,
            creator_id: ctx.user.id,
          },
          select: {
            file_name: true,
          },
        });
        const signedURLPromises = fileNames.map(async (record) => {
          const expiresIn = 60 * 60 * 24 * 7;
          const fullFilePath = `${ctx.user.id}/${record.file_name}`;
          const { data: signedURL, error: signedURLError } =
            await ctx.supabaseServerClient.storage
              .from("tts-audio")
              .createSignedUrl(fullFilePath, expiresIn);

          if (signedURLError) {
            console.error(
              `Error creating signed URL: ${signedURLError.message}`
            );
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create signed URL",
            });
          }

          return { signedURL: signedURL.signedUrl, fileName: record.file_name };
        });

        const signedURLs = await Promise.all(signedURLPromises);

        return signedURLs;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
  getTextToSpeechFileName: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { fileName } = input;

      try {
        const expiresIn = 60 * 60 * 24 * 7;
        const fullFilePath = `${ctx.user.id}/${fileName}`;
        const { data: signedURL, error: signedURLError } =
          await ctx.supabaseServerClient.storage
            .from("tts-audio")
            .createSignedUrl(fullFilePath, expiresIn);

        if (signedURLError) {
          console.error(`Error creating signed URL: ${signedURLError.message}`);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create signed URL",
          });
        }

        return { signedURL: signedURL.signedUrl, fileName };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
});
