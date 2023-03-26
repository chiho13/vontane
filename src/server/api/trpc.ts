/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

import { prisma } from "@/server/db";

import { TRPCError } from "@trpc/server";

// import { rateLimiter } from "./middleware";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type CreateContextOptions = Record<string, never>;

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (
  _opts: CreateContextOptions,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const supabaseServerClient = createServerSupabaseClient({
    req,
    res,
  });

  return {
    prisma,
    supabaseServerClient,
    req,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = (_opts: CreateNextContextOptions) => {
  return createInnerTRPCContext({}, _opts.req, _opts.res);
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer.
 */
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { NextApiRequest, NextApiResponse } from "next/types";

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */

const isAuthed = t.middleware(async ({ next, ctx }) => {
  const {
    data: { user },
    error,
  } = await ctx.supabaseServerClient.auth.getUser();

  if (error || !user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const rateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 s"),
});

const rateLimiterMiddleware = t.middleware(async ({ next, ctx }) => {
  const ip = ctx.req.socket.remoteAddress ?? "127.0.0.1";

  const { success, remaining } = await rateLimiter.limit(`mw_${ip}`);
  console.log(
    "Rate limiter middleware: Success:",
    success,
    "Remaining:",
    remaining
  );

  if (!success) {
    throw new TRPCError({
      code: "CUSTOM",
      message: "Too many requests, please try again later.",
      status: 429,
    });
  }

  return next();
});

export const publicProcedure = t.procedure.use(rateLimiterMiddleware);
export const protectedProcedure = t.procedure
  .use(isAuthed)
  .use(rateLimiterMiddleware);
