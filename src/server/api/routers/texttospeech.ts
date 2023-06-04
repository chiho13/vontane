import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { uploadAudioToSupabase } from "@/server/lib/uploadAudio";
import { nanoid } from "nanoid";

const secretkey = process.env.ELEVENLABS_APIKEY;
const userId = process.env.PLAYHT_USERID;

export const texttospeechRouter = createTRPCRouter({
  getVoices: protectedProcedure.query(async () => {
    const url = "https://api.elevenlabs.io/v1/voices";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          "xi-api-key": secretkey,
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
        voice_id: z.string(),
        content: z.string(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${input.voice_id}`;
      const { supabaseServerClient } = ctx;
      const requestbody = {
        text: input.content,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0,
          similarity_boost: 0,
        },
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            accept: "audio/mpeg",
            "xi-api-key": secretkey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestbody),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);

        const fileName = `${nanoid()}.mp3`;
        // return audioUrl;
        const uploadedUrl = await uploadAudioToSupabase(
          ctx.prisma,
          supabaseServerClient,
          audioUrl,
          fileName,
          input.workspaceId
        );
        return { url: uploadedUrl, fileName };
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
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
  deleteAudio: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { supabaseServerClient } = ctx;
      const { fileName, workspaceId } = input;

      const {
        data: { user },
      } = await supabaseServerClient.auth.getUser();
      const userId = user?.id;
      try {
        // Check the workspaceId if needed and make sure the current user has access to delete the file.

        // Split the audioURL into bucket and path
        const filePath = `${userId}/${workspaceId}/${fileName}`;

        const { error } = await supabaseServerClient.storage
          .from("tts-audio")
          .remove([filePath]);

        if (error) {
          throw error;
        }

        return { message: "Audio file deleted successfully." };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),

  // getTextToSpeechFileNames: protectedProcedure
  //   .input(
  //     z.object({
  //       workspaceId: z.string(),
  //     })
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const { workspaceId } = input;

  //     try {
  //       const fileNames = await ctx.prisma.texttospeech.findMany({
  //         where: {
  //           workspace_id: workspaceId,
  //           creator_id: ctx.user.id,
  //         },
  //         select: {
  //           file_name: true,
  //         },
  //       });
  //       const signedURLPromises = fileNames.map(async (record) => {
  //         const expiresIn = 60 * 60 * 24 * 7;
  //         const fullFilePath = `${ctx.user.id}/${record.file_name}`;
  //         const { data: signedURL, error: signedURLError } =
  //           await ctx.supabaseServerClient.storage
  //             .from("tts-audio")
  //             .createSignedUrl(fullFilePath, expiresIn);

  //         if (signedURLError) {
  //           console.error(
  //             `Error creating signed URL: ${signedURLError.message}`
  //           );
  //           throw new TRPCError({
  //             code: "INTERNAL_SERVER_ERROR",
  //             message: "Failed to create signed URL",
  //           });
  //         }

  //         return { signedURL: signedURL.signedUrl, fileName: record.file_name };
  //       });

  //       const signedURLs = await Promise.all(signedURLPromises);

  //       return signedURLs;
  //     } catch (error) {
  //       console.error(error);
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Internal server error",
  //       });
  //     }
  //   }),
  getTextToSpeechFileName: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        workspaceId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { fileName, workspaceId } = input;

      try {
        const expiresIn = 60 * 60 * 24 * 7;
        const fullFilePath = `${ctx.user.id}/${workspaceId}/${fileName}`;
        console.log(fullFilePath);
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
