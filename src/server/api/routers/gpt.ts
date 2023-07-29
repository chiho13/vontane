import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { Configuration, OpenAIApi } from "openai";
import { uploadImage, uploadImageBlob } from "@/server/lib/uploadImage";
import { nanoid } from "nanoid";
import { rateLimiterMiddleware } from "@/server/api/trpc";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const base64ToBlob = (base64) => {
  // Convert base64 to raw binary data held in a string
  const byteString = atob(base64.split(",")[1]);

  // Separate out the mime component
  const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];

  // Write the bytes of the string to an ArrayBuffer
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const _ia = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    _ia[i] = byteString.charCodeAt(i);
  }

  const dataView = new DataView(arrayBuffer);
  const blob = new Blob([dataView], { type: mimeString });
  return blob;
};

export const GPTRouter = createTRPCRouter({
  createimage: protectedProcedure
    .use(rateLimiterMiddleware)
    .input(
      z.object({
        prompt: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { prompt } = input;
      let response;

      // Fetch the current credits of the user
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id as string },
        select: { credits: true },
      });

      // Check if user has enough credits
      if (user?.credits < 250) {
        throw new Error("Not enough credits");
      }

      // Perform tasks in a transaction
      try {
        // Try to generate the image
        response = await openai.createImage({
          prompt: prompt,
          n: 3,
          size: "1024x1024",
        });

        // If successful, decrement the credits
        const updatedUser = await ctx.prisma.user.update({
          where: { id: ctx.user.id as string },
          data: { credits: { decrement: 50 } },
          select: { credits: true },
        });

        // Return the updated credits and the response data
        return { credits: updatedUser.credits, data: response.data };
      } catch (error) {
        console.error(`Error: ${error.message}`);
        throw new Error("An error occurred while processing your request");
      }
    }),

  selectImage: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        imageURL: z.string(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { fileName, imageURL, workspaceId } = input;
      const { supabaseServerClient, prisma } = ctx;
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
  selectImageFromBase64: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        workspaceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { imageBase64, workspaceId } = input;
      const { supabaseServerClient, prisma } = ctx;
      // Extract MIME type from the base64 string

      if (!imageBase64) {
        throw new Error("Image data is missing.");
      }

      let match = imageBase64.match(
        /data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/
      );
      const mimeType = match ? match[1] : null;

      // Convert MIME type to file extension
      const extensions = {
        "image/jpeg": "jpeg",
        "image/png": "png",
        "image/gif": "gif",
        // Add more if needed
      };
      const extension = mimeType && extensions[mimeType];

      const fileName = `${nanoid()}.${extension}`;

      // Convert base64 string to Blob
      const imageBlob = base64ToBlob(imageBase64);

      const uploadedURL = await uploadImageBlob(
        prisma,
        supabaseServerClient,
        imageBlob,
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

        const data = completion?.data?.choices?.[0]?.message?.content;

        return data;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
  translate: protectedProcedure
    .input(
      z.object({
        language: z.string(),
        prompt: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { language, prompt } = input;
      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You will be given a sentence. Detect the language and translate into ${language}. Return the translate text in html format. Do not return other text.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 5000,
          temperature: 0.8,
        });

        const data = completion?.data?.choices?.[0]?.message?.content;

        return data;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
  locationSearch: protectedProcedure
    .use(rateLimiterMiddleware)
    .input(
      z.object({
        location: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { location } = input;

      // Make sure to replace YOUR_MAPTILER_API_KEY with your actual API key
      const encodedLocation = encodeURIComponent(location);
      const url = `https://api.maptiler.com/geocoding/${encodedLocation}.json?key=EeJqZWmMwWuKBDTgCto5&language=en`;

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
          });
        }

        const data = await response.json();

        // Get the first result and extract the lat, lng from it
        return data;
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        });
      }
    }),
  locationName: protectedProcedure
    .use(rateLimiterMiddleware)
    .input(
      z.object({
        lat: z.number(),
        lng: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { lat, lng } = input;

      const apiKey = "EeJqZWmMwWuKBDTgCto5"; // replace with your actual API key

      const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?types=address&key=${apiKey}`;

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        });

        const data = await response.json();

        return data;
      } catch (error) {
        throw new Error(`Error: ${error}`);
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

        const data = completion?.data?.choices?.[0]?.message?.content;

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

        const data = completion?.data?.choices?.[0]?.message?.content;

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

        const data = completion?.data?.choices?.[0]?.message?.content;

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
