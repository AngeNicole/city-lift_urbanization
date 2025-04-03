import { Router, Request, Response } from "express";
import { PrismaClient, VehicleType, VehicleStatus, UserRole } from "@prisma/client";
import { ObjectId } from "mongodb";

const router = Router();
const prisma = new PrismaClient();

// Create Vehicle
router.post("/", async (req: Request, res: any) => {
  const { type, name, plateNumber, status } = req.body;

  if (!type || !name || !plateNumber || !status) {
    return res.status(400).json({ error: "All fields (type, name, plateNumber, status) are required" });
  }

  const role = (req as any).user.role as UserRole;
  if (role !== UserRole.ADMIN && role !== UserRole.DRIVER) {
    return res.status(403).json({ error: "Only drivers/admin can create vehicles" });
  }

  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        type,
        name,
        plateNumber,
        status
      },
      include: {
        user: true,
      },
    });
    res.status(201).json(newVehicle);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: `Duplicate field: ${error.meta?.target?.join(", ")}` });
    }
    res.status(500).json({ error: "Failed to create vehicle" });
  }
});


// Assign Vehicle to a Driver (Admin only)
router.put("/:id/assign", async (req: Request<{ id: string }>, res: any) => {
  const { id } = req.params;
  const { userId } = req.body;

  const role = (req as any).user.role as UserRole;
  if (role !== UserRole.ADMIN) {
    return res.status(403).json({ error: "Only admins can assign vehicles" });
  }

  if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid vehicle or user ID format" });
  }

  try {
    // Ensure the user exists and is a driver
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "DRIVER") {
      return res.status(400).json({ error: "Target user must be a driver" });
    }

    // Assign the vehicle
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        userId,
      },
      include: {
        user: true,
      },
    });

    res.json({ message: "Vehicle assigned successfully", vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign vehicle" });
  }
});


// Get All Vehicles
router.get("/", async (_req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });
    res.json(vehicles);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

// Get Vehicle by ID
router.get("/one/:id", async (req: Request<{ id: string }>, res: any) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid vehicle ID format" });
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});

// Get Vehicle by ID
router.get("/assigned-me/:userId", async (req: Request<{ userId: string }>, res: any) => {
  const { userId } = req.params;
  if (!ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid vehicle ID format" });
  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { 
        userId
       },
      include: {
        user: true,
      },
    });
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});

// Update Vehicle
router.put("/:id", async (req: Request<{ id: string }>, res: any) => {
  const { id } = req.params;
  const { type, name, plateNumber, status } = req.body;

  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid vehicle ID format" });

  try {
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        type: type as VehicleType,
        name,
        plateNumber,
        status: status as VehicleStatus,
      },
      include: {
        user: true,
      },
    });
    res.json(updatedVehicle);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: `Duplicate field: ${error.meta?.target?.join(", ")}` });
    }
    res.status(400).json({ error: "Vehicle update failed" });
  }
});

// Delete Vehicle
router.delete("/:id", async (req: Request<{ id: string }>, res: any) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid vehicle ID format" });

  try {
    await prisma.vehicle.delete({ where: { id } });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Vehicle deletion failed" });
  }
});

export const vehicleRoutes = router;
