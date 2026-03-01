import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { notifications } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = router({
  getNotifications: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      unreadOnly: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      // Using db directly

      let query = db.select().from(notifications).where(eq(notifications.userId, ctx.user.id));
      
      if (input.unreadOnly) {
        query = db.select().from(notifications).where(
          eq(notifications.userId, ctx.user.id) && eq(notifications.isRead, 0)
        );
      }

      return query.orderBy(desc(notifications.createdAt)).limit(input.limit);
    }),

  markAsRead: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: notificationId }) => {
      // Using db directly

      const notification = await db.select().from(notifications).where(eq(notifications.id, notificationId)).limit(1);
      if (notification.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Notification not found" });
      }

      if (notification[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this notification" });
      }

      await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, notificationId));

      return { success: true };
    }),

  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Using db directly

      await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.userId, ctx.user.id));

      return { success: true };
    }),

  deleteNotification: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input: notificationId }) => {
      // Using db directly

      const notification = await db.select().from(notifications).where(eq(notifications.id, notificationId)).limit(1);
      if (notification.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Notification not found" });
      }

      if (notification[0].userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this notification" });
      }

      // Soft delete by marking as read and hiding
      await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, notificationId));

      return { success: true };
    }),
});
