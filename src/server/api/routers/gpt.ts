import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Configuration, OpenAIApi } from "openai";
import { uploadImage } from "@/server/lib/uploadImage";
import { nanoid } from "nanoid";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const GPTRouter = createTRPCRouter({
  createimage: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { prompt } = input;

      const response = await openai.createImage({
        prompt: prompt,
        n: 3,
        size: "1024x1024",
      });

      return response.data;
    }),
  selectImage: protectedProcedure
    .input(
      z.object({
        imageURL: z.string(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { imageURL, workspaceId } = input;
      const { supabaseServerClient, prisma } = ctx;
      const fileName = `${nanoid()}.png`;
      // return audioUrl;
      const uploadedURL = await uploadImage(
        prisma,
        supabaseServerClient,
        imageURL,
        fileName,
        workspaceId
      );

      return { fileName, url: uploadedURL };
    }),
  getAIImage: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        workspaceId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { fileName, workspaceId } = input;
      const { supabaseServerClient, prisma } = ctx;

      try {
        const expiresIn = 60 * 60 * 24 * 7;
        const fullFilePath = `${ctx.user.id}/${workspaceId}/${fileName}`;
        console.log(fullFilePath);
        const { data: signedURL, error: signedURLError } =
          await ctx.supabaseServerClient.storage
            .from("dalle")
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
             chemistry, mathematics, economics, finance. The JSON format should be {"result": "katex code", "alt": "accessible text of equation for screen readers", "note": "explanation"}. 
             Preserve the single backslashes in the KaTeX code by using double backslashes in string.
             Do not include any $ signs in the KaTeX code. 
             Double check sources for accuracy. 
             Be flexible with the input phrasing and recognize concepts even if they are slightly differently written.
              If you don't recognize the input, return the json object {"error": "Input not recognised"}.
             You must only give the JSON object in the response so it can be parsed.
              `,
            },
          ],
          max_tokens: 500,
          temperature: 0.2,
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
  katextotext: protectedProcedure
    .input(
      z.object({
        katex: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { katex } = input;
      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Please return a stringified JSON object containing the accessible natural language description of the KaTeX code: "${katex}" in the format {"result": "text"}.
              If you don't recognise the katex code return {"error": "Input not recognised"}.
              `,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
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

  mathQuestions: protectedProcedure
    .input(
      z.object({
        mathQuestions: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { mathQuestions } = input;
      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: `
              Generate a JSON object for Questions based on the following input:
              ${mathQuestions}
          
                Each question should have a paragraph element containing the question text. If an equation is necessary for the question, include an equation element with the related equation. An equation element should be followed by an empty paragraph element. The output should be an array of objects with the following structure:
          
          [
          {
          "type": "paragraph",
          "children": [{"text": "question"}]
          },
          {
          "type": "equation",
          "latex": "KaTeX code",
          "altText": "accessible natural language of equation for text to speech readers and change spelling of words into phonetic spelling so screen reader can read aloud verbatim.",
          "children": [{"text": ""}]
          },
          {
            "type": "paragraph",
            "children": [{"text": ""}]
            },
          ]
`,
            },
          ],
          max_tokens: 2000,
          temperature: 0.2,
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
  englishQuestions: protectedProcedure
    .input(
      z.object({
        englishQuestions: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { englishQuestions } = input;
      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: `
              Generate a JSON object for Questions based on the following input:
              ${englishQuestions}
          
                Each fill-in-the-blank question is  a paragraph element containing the question text. add { "text": " ", "blank": true } in list-item question if necessary. E.g '[{ "text": "She" }, { "text": " ", "blank": true }, {{ "text": "to the concert yesterday" }}]' Each item should have random 12 character generated ID. only one correctAnswer in list-item is true. The output should be an array of objects with the following structure:
          
          [
          {
            {
              type: "mcq",
              children: [
                { 
                  "type": "list-item",
                  "children": [{ "text": "question" }, { "text": " ", "blank": true }]
                },
                { 
                  "type": "ol",
                  "children": [
                    { type: "option-list-item", "children": [{ "text": "option 1" }], "correctAnswer": true/false },
                    { type: "option-list-item", "children": [{ "text": "option 2" }], "correctAnswer": true/false },
                    { "type": "option-list-item", "children": [{ "text": "option 3" }], "correctAnswer": true/false },
                    { "type": "option-list-item", "children": [{ "text": "option 4" }], "correctAnswer": true/false }
                  ]
                }
              ],
              "altText": "Accessible natural language text of the question and the multiple choices read like trivia shows or educational videos."
            },
            { 
              "type": "paragraph",
              "children": [{ "text": " " }]
            },
          ]

`,
            },
          ],
          max_tokens: 2000,
          temperature: 0.2,
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
