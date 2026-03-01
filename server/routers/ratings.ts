import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { ratings, rides } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const ratingsRouter = router({
  rateRide: protectedProcedure
    .input(z.object({
      rideId: z.number(),
      score: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Using db directly

      const ride = await db.select().from(rides).where(eq(rides.id, input.rideId)).limit(1);
      if (ride.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ride not found" });
      }

      const rideData = ride[0];
      if (rideData.passengerId !== ctx.user.id && rideData.driverId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not part of this ride" });
      }

      const toUserId = rideData.passengerId === ctx.user.id ? rideData.driverId : rideData.passengerId;
      if (!toUserId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot rate this ride" });
      }

      // Check if already rated
      const existingRating = await db.select().from(ratings).where(
        eq(ratings.rideId, input.rideId) && eq(ratings.fromUserId, ctx.user.id)
      ).limit(1);

      if (existingRating.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You have already rated this ride" });
      }

      await db.insert(ratings).values({
        fromUserId: ctx.user.id,
        toUserId: toUserId,
        rideId: input.rideId,
        score: input.score,
        comment: input.comment || null,
      });

      return { success: true };
    }),

  getRideRatings: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input: rideId }) => {
      // Using db directly

      const ride = await db.select().from(rides).where(eq(rides.id, rideId)).limit(1);
      if (ride.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ride not found" });
      }

      return db.select().from(ratings).where(eq(ratings.rideId, rideId));
    }),

  getUserRatings: protectedProcedure
    .input(z.number())
    .query(async ({ input: userId }) => {
      // Using db directly

      return db.select().from(ratings).where(eq(ratings.toUserId, userId));
    }),
});
