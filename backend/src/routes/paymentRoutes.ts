import { Router, Request, Response } from "express";
import { PrismaClient, PaymentMethod } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req: Request, res: any) => {
  const { userId, rideId, amount, method } = req.body;

  try {
    // Create or update payment for the ride
    const payment = await prisma.payment.upsert({
      where: {
      
        rideId_userId: {
          rideId,
          userId,
        }
      },
      update: {
        amount,
        method: method as PaymentMethod,
      },
      create: {
        userId,
        rideId,
        amount,
        method: method as PaymentMethod,
      },
    });

    // Get the ride to fetch vehicle ID
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
    });

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    // Update vehicle status to IN_USE
    await prisma.vehicle.update({
      where: { id: ride.vehicleId },
      data: { status: "IN_USE" },
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Payment creation or update failed" });
  }
});


// Get Payments by User ID
router.get("/user/:userId", async (req: Request<{ userId: string }>, res: any) => {
  const { userId } = req.params;
  try {
    const payments = await prisma.payment.findMany({ 
      where: { userId },
      include:{
        ride : true,
        user: true
      }
    
    });
    if (payments.length === 0) return res.status(404).json({ error: "No payments found for this user" });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Get Payment by Ride ID
router.get("/ride/:rideId", async (req: Request<{ rideId: string }>, res: any) => {
  const { rideId } = req.params;
  try {
    const payment = await prisma.payment.findUnique({ where: { rideId } });
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

export const paymentRoutes =  router;