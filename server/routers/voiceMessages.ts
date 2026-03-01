import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { voiceMessages, rides } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";
import { transcribeAudio } from "../_core/voiceTranscription";

export const voiceMessagesRouter = router({
  sendVoiceMessage: protectedProcedure
    .input(z.object({
      rideId: z.number(),
      audioData: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Using db directly

      // Verify ride exists and user is part of it
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
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot send message for this ride" });
      }

      try {
        // Upload audio to S3
        const buffer = Buffer.from(input.audioData, "base64");
        const fileKey = `voice-messages/${input.rideId}/${ctx.user.id}-${Date.now()}.mp3`;
        const { url: audioUrl } = await storagePut(fileKey, buffer, input.mimeType);

        // Transcribe audio (optional - in production, this would be async)
        let transcription = null;
        try {
          const result = await transcribeAudio({
            audioUrl,
            language: "fr",
          });
          if (result && "text" in result) {
            transcription = result.text;
          }
        } catch (error) {
          console.warn("Transcription failed:", error);
        }

        // Save voice message
        await db.insert(voiceMessages).values({
          rideId: input.rideId,
          fromUserId: ctx.user.id,
          toUserId: toUserId,
          audioUrl,
          transcription,
          duration: 0, // Would be calculated from audio
        });

        return { success: true, audioUrl, transcription };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send voice message" });
      }
    }),

  getRideVoiceMessages: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input: rideId }) => {
      // Using db directly

      // Verify ride exists and user is part of it
      const ride = await db.select().from(rides).where(eq(rides.id, rideId)).limit(1);
      if (ride.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ride not found" });
      }

      const rideData = ride[0];
      if (rideData.passengerId !== ctx.user.id && rideData.driverId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this ride" });
      }

      return db.select().from(voiceMessages).where(eq(voiceMessages.rideId, rideId));
    }),
});
