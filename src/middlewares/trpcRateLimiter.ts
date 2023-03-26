import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// export const rateLimiter = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(5, "1 s"),
// });

// export async function rateLimiterMiddleware(request: NextRequest) {
//   const ip = request.ip ?? "127.0.0.1";
//   const { success } = await rateLimiter.limit(`mw_${ip}`);

//   if (!success) {
//     throw new Error("Too many requests, please try again later.");
//   }
// }
