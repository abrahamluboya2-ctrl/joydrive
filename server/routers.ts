import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { driversRouter } from "./routers/drivers";
import { ridesRouter } from "./routers/rides";
import { notificationsRouter } from "./routers/notifications";
import { ratingsRouter } from "./routers/ratings";
import { filesRouter } from "./routers/files";
import { voiceMessagesRouter } from "./routers/voiceMessages";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  drivers: driversRouter,
  rides: ridesRouter,
  notifications: notificationsRouter,
  ratings: ratingsRouter,
  files: filesRouter,
  voiceMessages: voiceMessagesRouter,
});

export type AppRouter = typeof appRouter;
