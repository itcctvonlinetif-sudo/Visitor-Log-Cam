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
    const id = parseInt(req.params.id as string);
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
      
      // Check if RFID is already in use by a checked-in visitor
      if (data.rfidCardId) {
        const existingVisit = await storage.findVisitByRfid(data.rfidCardId);
        if (existingVisit && existingVisit.status === 'checked_in') {
          return res.status(400).json({ 
            message: `RFID ${data.rfidCardId} is currently being used by ${existingVisit.fullName}. Please check them out first or use a different card.` 
          });
        }
      }

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
    const id = parseInt(req.params.id as string);
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
    const id = parseInt(req.params.id as string);
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
    const id = parseInt(req.params.id as string);
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
      return res.json({ success: true, visit: updated, message: `Berhasil Check-out: ${visit.fullName}` });
    }

    if (visit && visit.status === 'checked_out') {
      return res.status(400).json({ 
        success: false, 
        message: `Kartu ini (${rfid}) sudah melakukan Check-out. Silakan registrasi ulang untuk kunjungan baru.` 
      });
    }

    return res.status(404).json({ 
      success: false, 
      message: "Kartu tidak terdaftar atau tidak ada kunjungan aktif." 
    });
  });

  // Database backup (JSON)
  app.get("/api/backup", async (_req, res) => {
    try {
      const visits = await storage.getVisits();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=backup.json');
      res.json(visits);
    } catch (e) {
      res.status(500).json({ message: "Backup failed" });
    }
  });

  return httpServer;
}
