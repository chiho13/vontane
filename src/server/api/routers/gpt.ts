import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `You are a text to katex api.
            Please return the JSON object containing the KaTeX code and explanation for '${equationName}', search for the concept relating to physics,
             chemistry, mathematics, economics, finance. The JSON format should be {"result": "katex code", "note": "explanation"}. 
             Preserve the single backslashes in the KaTeX code by using double backslashes in string.
             Do not include any $ signs in the KaTeX code. 
             Double check sources for accuracy. 
             Be flexible with the input phrasing and recognize concepts even if they are slightly differently written.
              If you don't recognize the input, return the json object {"error": "Input not recognised"}.
             You must only give the JSON object in the response so it can be parsed.
              `,
            },
          ],
          temperature: 0.6,
        });

        const data = completion.data.choices[0].message.content;
        return data;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
});
