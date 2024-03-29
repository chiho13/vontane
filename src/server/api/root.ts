import { createTRPCRouter } from "@/server/api/trpc";
import { exampleRouter } from "@/server/api/routers/example";
import { profileRouter } from "@/server/api/routers/profile";
import { workspaceRouter } from "@/server/api/routers/workspace";
import { texttospeechRouter } from "@/server/api/routers/texttospeech";
import { checkoutRouter } from "./routers/checkout";
import { GPTRouter } from "@/server/api/routers/gpt";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  profile: profileRouter,
  workspace: workspaceRouter,
  texttospeech: texttospeechRouter,
  gpt: GPTRouter,
  checkout: checkoutRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
