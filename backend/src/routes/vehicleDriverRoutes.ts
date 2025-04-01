import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ObjectId } from "mongodb";

const router = Router();
const prisma = new PrismaClient();

// Activate driver
router.post("/activate", async (req: Request, res: any) => {
  const user = (req as any).user;
  const { vehicleId, latitude, longitude } = req.body;

  // TODO: to uncomment this later
  // if (user.role !== "DRIVER") {
  //   return res.status(403).json({ error: "Only drivers can activate themselves" });
  // }

  if (!vehicleId || !latitude || !longitude) {
    return res.status(400).json({ error: "vehicleId, latitude, and longitude are required" });
  }

  if (!ObjectId.isValid(vehicleId)) {
    return res.status(400).json({ error: "Invalid vehicle ID" });
  }

  try {
    const existing = await prisma.vehicleDriver.findUnique({
      where: { userId: user.id },
    });

    const data = {
      userId: user.id,
      vehicleId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    const activeDriver = existing
      ? await prisma.vehicleDriver.update({
          where: { userId: user.id },
          data,
          include: { vehicle: true },
        })
      : await prisma.vehicleDriver.create({
          data,
          include: { vehicle: true },
        });

    res.status(200).json(activeDriver);
  } catch (error) {
    res.status(500).json({ error: "Failed to activate driver" });
  }
});

// Deactivate driver
router.delete("/deactivate", async (req: Request, res: any) => {
  const user = (req as any).user;

  if (user.role !== "DRIVER") {
    return res.status(403).json({ error: "Only drivers can deactivate" });
  }

  try {
    await prisma.vehicleDriver.delete({ where: { userId: user.id } });
    res.json({ message: "Driver deactivated successfully" });
  } catch (error) {
    res.status(404).json({ error: "No active driver session found" });
  }
});


router.get("/nearby", async (req: Request, res: any) => {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and Longitude are required" });
  }

  const lat = parseFloat(latitude as string);
  const lng = parseFloat(longitude as string);
  const searchRadius = parseFloat(radius as string) || 5; // Default 5 km
  const earthRadiusKm = 6371;
  const degreeOffset = searchRadius / earthRadiusKm;

  try {
    const drivers = await prisma.vehicleDriver.findMany({
      where: {
        latitude: { gte: lat - degreeOffset, lte: lat + degreeOffset },
        longitude: { gte: lng - degreeOffset, lte: lng + degreeOffset },
        vehicle: {
          status: "AVAILABLE",
        },
      },
      include: {
        user: true,
        vehicle: true,
      },
    });

    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch nearby drivers" });
  }
});


export const vehicleDriverRoutes = router;
