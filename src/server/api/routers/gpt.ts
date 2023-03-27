import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const GPTRouter = createTRPCRouter({
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
              You are a text to katex api.
              Please return the JSON object containing the KaTeX code and explanation for '${equationName}', search for the concept relating to physics,
               chemistry, mathematics, economics, finance. The JSON format should be {"result": "katex code", "note": "explanation"}. 
               Preserve the single backslashes in the KaTeX code by using double backslashes in string.
               Do not include any $ signs in the KaTeX code. 
               Double check sources for accuracy. 
               Be flexible with the input phrasing and recognize concepts even if they are slightly differently written.
                If you don't recognize the input, return the json object {"error": "Input not recognised"}.
               You must only give the JSON object in the response so it can be parsed.
                `,

              max_tokens: 400,
              temperature: 0.5,
            }),
          }
        );
        const data = await response.json();

        const jsonString = data.choices[0].text;

        return jsonString;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
});
