import { storage } from "./storage";

async function seed() {
  const existing = await storage.getVisits();
  if (existing.length > 0) {
    console.log("Database already seeded");
    return;
  }

  console.log("Seeding database...");

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  // Active visit
  await storage.createVisit({
    fullName: "Budi Santoso",
    rfidCardId: "1234567890",
    phoneNumber: "08123456789",
    address: "PT. Maju Mundur",
    meetingWith: "Pak Manager",
    purpose: "Meeting Project A",
    status: "checked_in",
    photoUrl: "https://ui-avatars.com/api/?name=Budi+Santoso&background=random"
  });

  // Checked out visit
  await storage.createVisit({
    fullName: "Siti Aminah",
    rfidCardId: "0987654321",
    phoneNumber: "08198765432",
    address: "Freelancer",
    meetingWith: "HRD",
    purpose: "Interview",
    status: "checked_out"
    // We can't easily set checkOutTime via createVisit as per schema default logic, 
    // but storage.createVisit just returns what DB returns.
    // To set checkOutTime, we might need to update it immediately or allow it in create schema (which we omitted).
    // Let's just create it then update it.
  });
  
  // Find and update the second one
  const visits = await storage.getVisits();
  const siti = visits.find(v => v.fullName === "Siti Aminah");
  if (siti) {
    await storage.updateVisit(siti.id, {
      checkOutTime: twoHoursAgo,
      status: "checked_out"
    });
  }

  console.log("Seeding complete");
}

seed().catch(console.error).finally(() => process.exit(0));
