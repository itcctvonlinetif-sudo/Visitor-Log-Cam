import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { visits, type Visit, type InsertVisit } from "@shared/schema";

export interface IStorage {
  getVisits(status?: string): Promise<Visit[]>;
  getVisit(id: number): Promise<Visit | undefined>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  updateVisit(id: number, visit: Partial<InsertVisit> & { status?: string, checkOutTime?: Date }): Promise<Visit>;
  deleteVisit(id: number): Promise<void>;
  findVisitByRfid(rfid: string): Promise<Visit | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getVisits(status?: string): Promise<Visit[]> {
    let query = db.select().from(visits).orderBy(desc(visits.checkInTime));
    if (status && status !== 'all') {
      // @ts-ignore - drizzle type inference issue with dynamic where
      query = query.where(eq(visits.status, status));
    }
    return await query;
  }

  async getVisit(id: number): Promise<Visit | undefined> {
    const [visit] = await db.select().from(visits).where(eq(visits.id, id));
    return visit;
  }

  async createVisit(insertVisit: InsertVisit): Promise<Visit> {
    const [visit] = await db.insert(visits).values(insertVisit).returning();
    return visit;
  }

  async updateVisit(id: number, updates: Partial<InsertVisit> & { status?: string, checkOutTime?: Date }): Promise<Visit> {
    const [updated] = await db
      .update(visits)
      .set(updates)
      .where(eq(visits.id, id))
      .returning();
    return updated;
  }

  async deleteVisit(id: number): Promise<void> {
    await db.delete(visits).where(eq(visits.id, id));
  }

  async findVisitByRfid(rfid: string): Promise<Visit | undefined> {
    // Find the latest ACTIVE visit for this RFID
    const [visit] = await db
      .select()
      .from(visits)
      .where(eq(visits.rfidCardId, rfid))
      .orderBy(desc(visits.checkInTime))
      .limit(1);
    return visit;
  }
}

export const storage = new DatabaseStorage();
