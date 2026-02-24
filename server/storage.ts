import { db } from "./db";
import { eq, desc, lt, and, sql } from "drizzle-orm";
import { visits, type Visit, type InsertVisit } from "@shared/schema";

export interface IStorage {
  getVisits(status?: string, search?: string): Promise<Visit[]>;
  getVisit(id: number): Promise<Visit | undefined>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  updateVisit(id: number, visit: Partial<InsertVisit> & { status?: string, checkOutTime?: Date }): Promise<Visit>;
  deleteVisit(id: number): Promise<void>;
  deleteVisitsByRange(range: "week" | "month" | "year"): Promise<number>;
  findVisitByRfid(rfid: string): Promise<Visit | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getVisits(status?: string, search?: string): Promise<Visit[]> {
    let query = db.select().from(visits).orderBy(desc(visits.checkInTime));
    
    const conditions = [];
    
    if (status && status !== 'all') {
      conditions.push(eq(visits.status, status));
    }
    
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(
        sql`lower(${visits.fullName}) LIKE ${searchLower} OR 
            lower(${visits.address}) LIKE ${searchLower} OR 
            lower(${visits.meetingWith}) LIKE ${searchLower}`
      );
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
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

  async deleteVisitsByRange(range: "week" | "month" | "year"): Promise<number> {
    const now = new Date();
    let cutoff = new Date();

    if (range === "week") {
      cutoff.setDate(now.getDate() - 7);
    } else if (range === "month") {
      cutoff.setMonth(now.getMonth() - 1);
    } else if (range === "year") {
      cutoff.setFullYear(now.getFullYear() - 1);
    }

    // Drizzle delete with where condition for checkInTime < cutoff
    const result = await db.delete(visits).where(lt(visits.checkInTime, cutoff)).returning();
    return result.length;
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
