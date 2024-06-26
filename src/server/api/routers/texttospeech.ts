import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { uploadAudioToSupabase } from "@/server/lib/uploadAudio";
import { nanoid } from "nanoid";

import OpenAPI from "openai";
import { rateLimiterMiddleware } from "@/server/api/trpc";
import axios from "axios";
import stream from "stream";
import util from "util";

import { Deepgram } from "@deepgram/sdk";

const deepgram = new Deepgram(process.env.DEEPGRAM_SECRET || "");

const openai = new OpenAPI({
  apiKey: process.env.OPENAI_API_KEY,
});

const secretkey = process.env.ELEVENLABS_APIKEY;
const userId = process.env.PLAYHT_USERID;
const pipeline = util.promisify(stream.pipeline);

export const texttospeechRouter = createTRPCRouter({
  getVoices: protectedProcedure.query(async () => {
    const url = "https://api.elevenlabs.io/v1/voices";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          "xi-api-key": secretkey,
        } as any,
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
    .use(rateLimiterMiddleware)
    .input(
      z.object({
        voice_id: z.string(),
        accent: z.string(),
        content: z.string(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${input.voice_id}`;
      const { supabaseServerClient } = ctx;

      // const completion = await openai.createChatCompletion({
      //   model: "gpt-4",
      //   messages: [
      //     {
      //       role: "system",
      //       content: `Find and convert numbers, day, month, year, and other notations to readable text of the same langauge as input.  Return the output as text. If there are no numbers or symbols, return original text. `,
      //     },
      //     {
      //       role: "user",
      //       content: input.content,
      //     },
      //   ],
      //   max_tokens: 5000,
      //   temperature: 0.8,
      // });

      // const data = completion?.data?.choices?.[0]?.message?.content;

      const requestbody = {
        text: input.content,
        model_id: "eleven_multilingual_v2",
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
          } as any,
          body: JSON.stringify(requestbody),
        });

        console.log(response);

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

        // await downloadFile(uploadedUrl, "temp.mp3");

        // const { data } = await openai.createTranscription(
        //   fs.createReadStream("temp.mp3"),
        //   "whisper-1"
        // );

        // Transcribe the audio
        // Sending the URL to a file

        let apiAccent;
        switch (input.accent) {
          case "british":
            apiAccent = "en-GB";
            break;
          case "american":
            apiAccent = "en-US";
            break;
          case "australian":
            apiAccent = "en-AU";
            break;
          default:
            // Default to en-US if accent value is not recognized
            apiAccent = "en-US";
            break;
        }

        const stopWords = [
          "a",
          "b",
          "c",
          "d",
          "e",
          "f",
          "g",
          "option",
          "an",
          "the",
          "and",
          "or",
          "but",
          "of",
          "with",
          "at",
          "from",
          "into",
          "during",
          "including",
          "until",
          "against",
          "among",
          "throughout",
          "despite",
          "towards",
          "upon",
          "concerning",
          "to",
          "in",
          "for",
          "on",
          "by",
          "about",
          "like",
          "through",
          "over",
          "before",
          "between",
          "after",
          "since",
          "without",
          "under",
          "within",
          "along",
          "following",
          "across",
          "behind",
          "beyond",
          "plus",
          "except",
          "but",
          "up",
          "out",
          "around",
          "down",
          "off",
          "above",
          "near",
        ];

        function extractKeywords(content) {
          return content
            .replace(/--/g, " ") // Replace -- with space
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ") // Remove punctuation
            .split(/\s+/) // Split into words by whitespace
            .filter(
              (word) =>
                word.length > 2 && !stopWords.includes(word.toLowerCase())
            ); // Remove stop words and words of length 2 or less
        }

        // const audioSource = { url: uploadedUrl };
        // const transcription = await deepgram.transcription.preRecorded(
        //   audioSource,
        //   {
        //     language: "en",
        //     model: "nova",
        //     keywords: extractKeywords(input.content),
        //   }
        // );

        // Extract the transcript from the response
        // const transcript = transcription?.results?.channels[0]?.alternatives[0];

        const updateCredits = await ctx.prisma.user.update({
          where: { id: ctx.user.id as string },
          data: { credits: { decrement: input.content.length } },
          select: { credits: true },
        });

        return { url: uploadedUrl, fileName, credits: updateCredits.credits };
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
