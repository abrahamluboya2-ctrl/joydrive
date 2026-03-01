import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { rides, drivers, vehicles, rideHistory } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const PRICING = {
  Lite: { baseFare: 5, kmRate: 1.8 },
  Drive: { baseFare: 9, kmRate: 2.8 },
  VIP: { baseFare: 22, kmRate: 6.5 },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const ridesRouter = router({
  requestRide: protectedProcedure
    .input(z.object({
      vehicleType: z.enum(["Lite", "Drive", "VIP"]),
      pickupLocation: z.object({
        address: z.string(),
        lat: z.number(),
        lng: z.number(),
      }),
      dropoffLocation: z.object({
        address: z.string(),
        lat: z.number(),
        lng: z.number(),
      }),
      paymentMethod: z.enum(["card", "cash"]).default("card"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Using db directly

      const pricing = PRICING[input.vehicleType];
      const distance = calculateDistance(
        input.pickupLocation.lat,
        input.pickupLocation.lng,
        input.dropoffLocation.lat,
        input.dropoffLocation.lng
      );
      const distanceFare = distance * pricing.kmRate;
      const baseFare = pricing.baseFare;
      const totalFare = baseFare + distanceFare;

      await db.insert(rides).values({
        passengerId: ctx.user.id,
        vehicleType: input.vehicleType,
        pickupLocation: input.pickupLocation,
        dropoffLocation: input.dropoffLocation,
        stops: null,
        estimatedDistance: distance.toString(),
        estimatedDuration: Math.ceil(distance / 50 * 60),
        baseFare: baseFare.toString(),
        distanceFare: distanceFare.toString(),
        totalFare: totalFare.toString(),
        paymentMethod: input.paymentMethod,
        status: "requested",
      });

      return {
        totalFare: totalFare.toString(),
        estimatedDuration: Math.ceil(distance / 50 * 60),
      };
    }),

  getRide: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input: rideId }) => {
      // Using db directly

      const result = await db.select().from(rides).where(eq(rides.id, rideId)).limit(1);
      if (result.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ride not found" });
      }

      const ride = result[0];
      if (ride.passengerId !== ctx.user.id && ride.driverId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this ride" });
      }

      return ride;
    }),

  getPassengerRides: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Using db directly

      return db.select().from(rides).where(eq(rides.passengerId, ctx.user.id)).limit(input.limit);
    }),

  cancelRide: protectedProcedure
    .input(z.object({
      rideId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Using db directly

      const ride = await db.select().from(rides).where(eq(rides.id, input.rideId)).limit(1);
      if (ride.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ride not found" });
      }

      if (ride[0].passengerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not the passenger of this ride" });
      }

      if (!["requested", "accepted"].includes(ride[0].status)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot cancel this ride" });
      }

      await db.update(rides).set({
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason: input.reason || null,
      }).where(eq(rides.id, input.rideId));

      return { success: true };
    }),
});
