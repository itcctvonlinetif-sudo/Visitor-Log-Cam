import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVisitSchema } from "@shared/schema";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all visits
  app.get(api.visits.list.path, async (req, res) => {
    const status = req.query.status as string | undefined;
    const visits = await storage.getVisits(status);
    res.json(visits);
  });

  // Get single visit
  app.get(api.visits.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const visit = await storage.getVisit(id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }
    res.json(visit);
  });

  // Create visit
  app.post(api.visits.create.path, async (req, res) => {
    try {
      const data = insertVisitSchema.parse(req.body);
      const visit = await storage.createVisit(data);
      res.status(201).json(visit);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors[0].message });
      }
      throw e;
    }
  });

  // Update visit
  app.patch(api.visits.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    // Parse dates if present
    if (updates.checkOutTime) {
      updates.checkOutTime = new Date(updates.checkOutTime);
    }

    try {
      const updated = await storage.updateVisit(id, updates);
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: "Failed to update visit" });
    }
  });

  // Checkout (Shortcut)
  app.post(api.visits.checkout.path, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const updated = await storage.updateVisit(id, {
        status: 'checked_out',
        checkOutTime: new Date()
      });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ message: "Failed to checkout" });
    }
  });

  // Delete visit
  app.delete(api.visits.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteVisit(id);
    res.status(204).send();
  });

  // Scan RFID
  app.post(api.visits.scanRfid.path, async (req, res) => {
    const { rfid } = req.body;
    if (!rfid) return res.status(400).json({ message: "RFID required" });

    // Logic: Find most recent visit by this RFID
    // If found and checked_in -> check them out
    // If not found or checked_out -> return info (maybe pre-fill form in frontend, but for now just return info)
    
    // For this app, let's assume if we scan an RFID of a checked-in user, we check them out.
    // If they are not checked in, we just return the visitor info if exists (for re-entry) or nothing.
    
    const visit = await storage.findVisitByRfid(rfid);
    
    if (visit && visit.status === 'checked_in') {
      // Auto checkout
      const updated = await storage.updateVisit(visit.id, {
        status: 'checked_out',
        checkOutTime: new Date()
      });
      return res.json({ success: true, visit: updated, message: `Checked out ${visit.fullName}` });
    }

    // If previously visited but currently checked out, just return info so frontend can use it?
    // Or just say "Card free"
    return res.json({ success: true, visit: visit, message: "Card scanned" });
  });

  return httpServer;
}
