import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { drivers, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const driversRouter = router({
  register: protectedProcedure
    .input(z.object({
      licenseNumber: z.string().min(5),
      licenseExpiry: z.date(),
      bankAccount: z.string().min(10),
    }))
    .mutation(async ({ ctx, input }) => {
      // Using db directly

      const existingDriver = await db.select().from(drivers).where(eq(drivers.userId, ctx.user.id)).limit(1);
      if (existingDriver.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User is already registered as a driver" });
      }

      await db.insert(drivers).values({
        userId: ctx.user.id,
        licenseNumber: input.licenseNumber,
        licenseExpiry: input.licenseExpiry,
        bankAccount: input.bankAccount,
        isVerified: 0,
        status: "offline",
      });

      await db.update(users).set({ role: "driver" }).where(eq(users.id, ctx.user.id));

      return { success: true };
    }),

  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      // Using db directly

      const driver = await db.select().from(drivers).where(eq(drivers.userId, ctx.user.id)).limit(1);
      if (driver.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Driver profile not found" });
      }

      return driver[0];
    }),

  updateStatus: protectedProcedure
    .input(z.enum(["offline", "online", "on_ride", "break"]))
    .mutation(async ({ ctx, input }) => {
      // Using db directly

      const driver = await db.select().from(drivers).where(eq(drivers.userId, ctx.user.id)).limit(1);
      if (driver.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Driver profile not found" });
      }

      await db.update(drivers).set({ status: input }).where(eq(drivers.id, driver[0].id));

      return { success: true, status: input };
    }),
});
