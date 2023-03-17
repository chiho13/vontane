import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

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
  getSpeechStatus: protectedProcedure
    .input(
      z.object({
        transcriptionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { transcriptionId } = input;
      const url = `https://play.ht/api/v1/articleStatus?transcriptionId=${transcriptionId}`;

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
});
