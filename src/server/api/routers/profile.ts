import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const profileRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const profile = ctx.prisma.profiles.findUnique({
        where: { id: input.id },
      });
      if (!profile) {
        throw new Error("Profile not found");
      }
      return profile;
    }),
});
