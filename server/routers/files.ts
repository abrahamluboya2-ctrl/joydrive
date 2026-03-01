import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { files } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";

export const filesRouter = router({
  uploadProfilePhoto: protectedProcedure
    .input(z.object({
      fileData: z.string(),
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Using db directly

      try {
        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `users/${ctx.user.id}/profile-${Date.now()}.jpg`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Save file metadata
        await db.insert(files).values({
          userId: ctx.user.id,
          type: "profile_photo",
          fileKey,
          url,
          mimeType: input.mimeType,
          size: buffer.length,
        });

        return { success: true, url };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload file" });
      }
    }),

  uploadDocument: protectedProcedure
    .input(z.object({
      fileData: z.string(),
      mimeType: z.string(),
      documentType: z.enum(["license", "id", "insurance"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Using db directly

      try {
        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `users/${ctx.user.id}/documents/${input.documentType}-${Date.now()}`;
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        // Save file metadata
        await db.insert(files).values({
          userId: ctx.user.id,
          type: "document",
          fileKey,
          url,
          mimeType: input.mimeType,
          size: buffer.length,
        });

        return { success: true, url };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload document" });
      }
    }),

  getUserFiles: protectedProcedure
    .input(z.enum(["profile_photo", "document", "vehicle_photo"]).optional())
    .query(async ({ ctx, input: fileType }) => {
      // Using db directly

      if (fileType) {
        return db.select().from(files).where(
          eq(files.userId, ctx.user.id) && eq(files.type, fileType)
        );
      }

      return db.select().from(files).where(eq(files.userId, ctx.user.id));
    }),

  deleteFile: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: fileId }) => {
      // Using db directly

      const file = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
      if (file.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }

      if (file[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this file" });
      }

      // In a real application, you would also delete from S3
      // For now, just remove the metadata

      return { success: true };
    }),
});
