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
import { createTRPCUpstashLimiter } from "@trpc-limiter/upstash";
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import { prisma } from "@/server/db";
import { stripe } from "@/server/stripe/client";

import { TRPCError } from "@trpc/server";
import ws from "ws";
// import { rateLimiter } from "./middleware";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import * as trpcNext from "@trpc/server/adapters/next";

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

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseServerClient = createClient(supabaseUrl, supabaseServiceRoleKey);
const session = supabaseServerClient.auth.getUser();

export const createInnerTRPCContext = (
  opts:
    | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
    | trpcNext.CreateNextContextOptions,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  return {
    prisma,
    stripe,
    session,
    req,
    res,
  };
};

export const CTXT = (
  opts:
    | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
    | trpcNext.CreateNextContextOptions
) => {
  return {
    prisma,
    stripe,
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
import { IncomingMessage } from "http";

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

const getFingerprint = (req: NextApiRequest) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded
    ? (typeof forwarded === "string" ? forwarded : forwarded[0])?.split(/, /)[0]
    : req.socket.remoteAddress;
  console.log(ip);
  return ip || "127.0.0.1";
};

export const rateLimiterMiddleware = createTRPCUpstashLimiter({
  root: t,
  fingerprint: (ctx) => getFingerprint(ctx.req),
  windowMs: 20000,
  message: (hitInfo) =>
    `Too many requests, please try again later. ${Math.ceil(
      (hitInfo.reset - Date.now()) / 1000
    )}`,
  onLimit: (hitInfo) => {
    console.log(hitInfo);
  },
  max: 5,
});

// export const publicProcedure = t.procedure.use(rateLimiterMiddleware);
// export const protectedProcedure = t.procedure
//   .use(isAuthed)
//   .use(rateLimiterMiddleware);

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
