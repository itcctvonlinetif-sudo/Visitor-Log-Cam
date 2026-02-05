import { pgTable, text, serial, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  rfidCardId: varchar("rfid_card_id", { length: 50 }),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  address: text("address"), // Company or Address
  meetingWith: text("meeting_with").notNull(),
  purpose: text("purpose").notNull(),
  photoUrl: text("photo_url"), // URL to stored image
  checkInTime: timestamp("check_in_time").defaultNow().notNull(),
  checkOutTime: timestamp("check_out_time"),
  status: varchar("status", { length: 20 }).default("checked_in").notNull(), // 'checked_in', 'checked_out'
});

export const insertVisitSchema = createInsertSchema(visits).omit({ 
  id: true, 
  checkInTime: true,
  checkOutTime: true,
  status: true 
}).extend({
  photo: z.string().optional() // Base64 string from camera
});

export type Visit = typeof visits.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;

// API Types
export type CreateVisitRequest = InsertVisit;
export type UpdateVisitRequest = Partial<InsertVisit> & { status?: string, checkOutTime?: string };
