import { Router, Request } from 'express'
import { PrismaClient, RideStatus, VehicleType } from '@prisma/client'
import { ObjectId } from 'mongodb'

const router = Router()
const prisma = new PrismaClient()

// Create Ride
router.post('/', async (req: Request, res: any) => {
  const { userId, vehicleId, rideType, startLocation, endLocation, fare } =
    req.body

  if (!userId || !vehicleId || !startLocation || !endLocation || !fare) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  try {
    const ride = await prisma.ride.create({
      data: {
        userId,
        vehicleId,
        startLocation,
        endLocation,
        fare,
        status: RideStatus.PENDING,
      },
    })
    res.status(201).json(ride)
  } catch (error) {
    console.log(error)
    res.status(400).json({ error: 'Ride creation failed' })
  }
})

// Get All Rides
router.get('/', async (_req: Request, res: any) => {
  try {
    const rides = await prisma.ride.findMany({
      orderBy: {
        startTime: 'desc',
      },
      include: {
        user: true,
        vehicle: true,
        payment: true,
      },
    })
    res.json(rides)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rides' })
  }
})

// Get all rides for the current user or rides assigned to a driver
router.get('/my', async (req: Request, res: any) => {
    const user = (req as any).user;
  
    if (!user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      const rides = await prisma.ride.findMany({
        where: user.role === 'DRIVER'
          ? {
              vehicle: {
                userId: user.id, // for drivers: get rides on vehicles they own
              },
            }
          : {
              userId: user.id, // for regular users: get rides they requested
            },
        orderBy: { startTime: 'desc' },
        include: {
          user: true,
          vehicle: true,
          payment: true,
        },
      });
   console.log(rides)
      res.status(200).json(rides);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rides' });
    }
  });
  


  

// Update Ride Status (Complete, Active, or Cancel Ride)
// Update Ride Status (Complete, Active, or Cancel Ride)
router.put('/:id/status', async (req: Request<{ id: string }>, res: any) => {
    const { id } = req.params
    const { status } = req.body
  
    if (!ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid ride ID format' })
  
    if (!Object.values(RideStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid ride status' })
    }
  
    try {
      // First, update the ride status
      const updatedRide = await prisma.ride.update({
        where: { id },
        data: { status },
        include: {
          user: true,
          vehicle: true,
          payment: true,
        },
      });
  
      // If the ride is completed or cancelled, mark the vehicle as AVAILABLE
      if (status === RideStatus.COMPLETED || status === RideStatus.CANCELLED) {
        await prisma.vehicle.update({
          where: { id: updatedRide.vehicleId },
          data: { status: 'AVAILABLE' },
        });
      }
  
      res.json(updatedRide);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update ride status' });
    }
  });
  

export const rideRoutes = router
