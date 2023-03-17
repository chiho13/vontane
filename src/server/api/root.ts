import { createTRPCRouter } from "@/server/api/trpc";
import { exampleRouter } from "@/server/api/routers/example";
import { profileRouter } from "@/server/api/routers/profile";
import { texttospeechRouter } from "@/server/api/routers/texttospeech";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  profile: profileRouter,
  texttospeech: texttospeechRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
