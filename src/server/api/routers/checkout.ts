import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  createStripeCustomerIfNeeded,
  fetchProducts,
} from "@/server/lib/createStripeCustomer";

export const checkoutRouter = createTRPCRouter({
  fetchProducts: protectedProcedure.query(async ({ ctx }) => {
    const products = await fetchProducts();
    return products;
  }),
});
