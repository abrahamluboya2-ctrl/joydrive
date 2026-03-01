import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import { ENV } from "./_core/env";

if (!ENV.databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

const client = postgres(ENV.databaseUrl, {
  prepare: false,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;

// User operations
export async function getUserByOpenId(openId: string) {
  const result = await db.query.users.findFirst({
    where: eq(schema.users.openId, openId),
  });
  return result || null;
}

export async function getUserById(id: number) {
  const result = await db.query.users.findFirst({
    where: eq(schema.users.id, id),
  });
  return result || null;
}

export async function upsertUser(data: {
  openId: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  loginMethod?: string | null;
  role?: "user" | "admin" | "driver";
  photoUrl?: string | null;
  lastSignedIn?: Date;
}) {
  const existing = await getUserByOpenId(data.openId);

  if (existing) {
    // Update existing user
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.loginMethod !== undefined) updateData.loginMethod = data.loginMethod;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
    if (data.lastSignedIn !== undefined) updateData.lastSignedIn = data.lastSignedIn;
    if (data.role !== undefined) updateData.role = data.role;

    if (Object.keys(updateData).length > 0) {
      await db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.openId, data.openId));
    }

    return await getUserByOpenId(data.openId);
  } else {
    // Create new user
    const result = await db
      .insert(schema.users)
      .values({
        openId: data.openId,
        name: data.name || null,
        email: data.email || null,
        phone: data.phone || null,
        loginMethod: data.loginMethod || null,
        role: data.role || "user",
        photoUrl: data.photoUrl || null,
        lastSignedIn: data.lastSignedIn || new Date(),
      })
      .returning();

    return result[0] || null;
  }
}

// Driver operations
export async function getDriverByUserId(userId: number) {
  const result = await db.query.drivers.findFirst({
    where: eq(schema.drivers.userId, userId),
  });
  return result || null;
}

export async function createDriver(data: {
  userId: number;
  licenseNumber: string;
  licenseExpiry: Date;
  bankAccount: string;
}) {
  const result = await db
    .insert(schema.drivers)
    .values({
      userId: data.userId,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      bankAccount: data.bankAccount,
      isVerified: 0,
      status: "offline",
    })
    .returning();

  return result[0] || null;
}

// Ride operations
export async function createRide(data: {
  passengerId: number;
  vehicleType: "Lite" | "Drive" | "VIP";
  pickupLocation: any;
  dropoffLocation: any;
  baseFare: number;
  totalFare: number;
}) {
  const result = await db
    .insert(schema.rides)
    .values({
      passengerId: data.passengerId,
      vehicleType: data.vehicleType,
      pickupLocation: data.pickupLocation,
      dropoffLocation: data.dropoffLocation,
      baseFare: data.baseFare.toString(),
      totalFare: data.totalFare.toString(),
      status: "requested",
      paymentMethod: "card",
      paymentStatus: "pending",
    })
    .returning();

  return result[0] || null;
}

export async function getRideById(id: number) {
  const result = await db.query.rides.findFirst({
    where: eq(schema.rides.id, id),
  });
  return result || null;
}

// Payment operations
export async function createPayment(data: {
  rideId: number;
  passengerId: number;
  amount: number;
  method: "card" | "cash";
}) {
  const result = await db
    .insert(schema.payments)
    .values({
      rideId: data.rideId,
      passengerId: data.passengerId,
      amount: data.amount.toString(),
      method: data.method,
      status: "pending",
    })
    .returning();

  return result[0] || null;
}

// Notification operations
export async function createNotification(data: {
  userId: number;
  type: string;
  title: string;
  content?: string;
  rideId?: number;
}) {
  const result = await db
    .insert(schema.notifications)
    .values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content || null,
      rideId: data.rideId || null,
      isRead: 0,
    })
    .returning();

  return result[0] || null;
}

export async function getUserNotifications(userId: number) {
  const result = await db.query.notifications.findMany({
    where: eq(schema.notifications.userId, userId),
  });
  return result || [];
}

// Rating operations
export async function createRating(data: {
  fromUserId: number;
  toUserId: number;
  rideId: number;
  score: number;
  comment?: string;
}) {
  const result = await db
    .insert(schema.ratings)
    .values({
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      rideId: data.rideId,
      score: data.score,
      comment: data.comment || null,
    })
    .returning();

  return result[0] || null;
}

// File operations
export async function uploadFile(data: {
  userId: number;
  type: "profile_photo" | "document" | "vehicle_photo";
  fileKey: string;
  url: string;
  mimeType?: string;
  size?: number;
}) {
  const result = await db
    .insert(schema.files)
    .values({
      userId: data.userId,
      type: data.type,
      fileKey: data.fileKey,
      url: data.url,
      mimeType: data.mimeType || null,
      size: data.size || null,
    })
    .returning();

  return result[0] || null;
}

export async function getUserFiles(userId: number) {
  const result = await db.query.files.findMany({
    where: eq(schema.files.userId, userId),
  });
  return result || [];
}
