import { integer, pgTable, text, timestamp, varchar, numeric, json, index, serial } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  photoUrl: text("photoUrl"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  ratingCount: integer("ratingCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Drivers table
 */
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  licenseNumber: varchar("licenseNumber", { length: 50 }).notNull(),
  licenseExpiry: timestamp("licenseExpiry").notNull(),
  bankAccount: varchar("bankAccount", { length: 100 }).notNull(),
  isVerified: integer("isVerified").default(0).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("offline"),
  currentLocation: json("currentLocation"),
  totalRides: integer("totalRides").default(0),
  totalEarnings: numeric("totalEarnings", { precision: 12, scale: 2 }).default("0"),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  ratingCount: integer("ratingCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("driver_userId_idx").on(table.userId),
}));

export type Driver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;

/**
 * Vehicles table
 */
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  driverId: integer("driverId").notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  licensePlate: varchar("licensePlate", { length: 20 }).notNull(),
  color: varchar("color", { length: 50 }),
  capacity: integer("capacity").default(4),
  make: varchar("make", { length: 100 }),
  model: varchar("model", { length: 100 }),
  year: integer("year"),
  photoUrl: text("photoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  driverIdIdx: index("vehicle_driverId_idx").on(table.driverId),
}));

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

/**
 * Rides/Courses
 */
export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  passengerId: integer("passengerId").notNull(),
  driverId: integer("driverId"),
  vehicleId: integer("vehicleId"),
  vehicleType: varchar("vehicleType", { length: 20 }).notNull(),
  pickupLocation: json("pickupLocation").notNull(),
  dropoffLocation: json("dropoffLocation").notNull(),
  stops: json("stops"),
  estimatedDistance: numeric("estimatedDistance", { precision: 8, scale: 2 }),
  estimatedDuration: integer("estimatedDuration"),
  baseFare: numeric("baseFare", { precision: 8, scale: 2 }).notNull(),
  distanceFare: numeric("distanceFare", { precision: 8, scale: 2 }).default("0"),
  timeFare: numeric("timeFare", { precision: 8, scale: 2 }).default("0"),
  totalFare: numeric("totalFare", { precision: 8, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("requested"),
  paymentMethod: varchar("paymentMethod", { length: 20 }).notNull().default("card"),
  paymentStatus: varchar("paymentStatus", { length: 20 }).notNull().default("pending"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  cancelledAt: timestamp("cancelledAt"),
  cancellationReason: text("cancellationReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  passengerIdIdx: index("ride_passengerId_idx").on(table.passengerId),
  driverIdIdx: index("ride_driverId_idx").on(table.driverId),
  statusIdx: index("ride_status_idx").on(table.status),
  vehicleTypeIdx: index("ride_vehicleType_idx").on(table.vehicleType),
}));

export type Ride = typeof rides.$inferSelect;
export type InsertRide = typeof rides.$inferInsert;

/**
 * Payments
 */
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  rideId: integer("rideId").notNull(),
  passengerId: integer("passengerId").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: varchar("method", { length: 20 }).notNull().default("card"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  stripePaymentId: varchar("stripePaymentId", { length: 100 }),
  stripeIntentId: varchar("stripeIntentId", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  rideIdIdx: index("payment_rideId_idx").on(table.rideId),
  passengerIdIdx: index("payment_passengerId_idx").on(table.passengerId),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Notifications
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  rideId: integer("rideId"),
  isRead: integer("isRead").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notification_userId_idx").on(table.userId),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Ratings
 */
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  fromUserId: integer("fromUserId").notNull(),
  toUserId: integer("toUserId").notNull(),
  rideId: integer("rideId").notNull(),
  score: integer("score").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  fromUserIdIdx: index("rating_fromUserId_idx").on(table.fromUserId),
  toUserIdIdx: index("rating_toUserId_idx").on(table.toUserId),
  rideIdIdx: index("rating_rideId_idx").on(table.rideId),
}));

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * Files (for photos and documents)
 */
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mimeType", { length: 50 }),
  size: integer("size"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("file_userId_idx").on(table.userId),
}));

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

/**
 * Voice Messages
 */
export const voiceMessages = pgTable("voiceMessages", {
  id: serial("id").primaryKey(),
  rideId: integer("rideId").notNull(),
  fromUserId: integer("fromUserId").notNull(),
  toUserId: integer("toUserId").notNull(),
  audioUrl: text("audioUrl").notNull(),
  transcription: text("transcription"),
  duration: integer("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  rideIdIdx: index("voiceMessage_rideId_idx").on(table.rideId),
}));

export type VoiceMessage = typeof voiceMessages.$inferSelect;
export type InsertVoiceMessage = typeof voiceMessages.$inferInsert;

/**
 * Ride History
 */
export const rideHistory = pgTable("rideHistory", {
  id: serial("id").primaryKey(),
  rideId: integer("rideId").notNull(),
  passengerId: integer("passengerId").notNull(),
  driverId: integer("driverId").notNull(),
  fromLocation: varchar("fromLocation", { length: 255 }).notNull(),
  toLocation: varchar("toLocation", { length: 255 }).notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  rideType: varchar("rideType", { length: 20 }).notNull(),
  distance: numeric("distance", { precision: 8, scale: 2 }),
  duration: integer("duration"),
  completedAt: timestamp("completedAt").notNull(),
}, (table) => ({
  passengerIdIdx: index("rideHistory_passengerId_idx").on(table.passengerId),
  driverIdIdx: index("rideHistory_driverId_idx").on(table.driverId),
}));

export type RideHistory = typeof rideHistory.$inferSelect;
export type InsertRideHistory = typeof rideHistory.$inferInsert;
