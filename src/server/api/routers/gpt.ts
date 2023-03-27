import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const texttospeechRouter = createTRPCRouter({
  getEquation: protectedProcedure
    .input(
      z.object({
        equationName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { equationName } = input;
      try {
        const response = await fetch(
          "https://api.openai.com/v1/engines/text-davinci-003/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              prompt: `
                You are given an equation name. You must only give the equation in katex code:
              ${equationName} in katex}`,
              max_tokens: 300,
              temperature: 0.5,
            }),
          }
        );
        const data = await response.json();

        return data.choices[0].text;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
});
