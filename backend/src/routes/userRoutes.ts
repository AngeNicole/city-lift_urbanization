import { Router, Request, Response } from "express";
import { PrismaClient, UserRole } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get All Users (excluding ADMINs), including assigned vehicles + active driver
router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: UserRole.ADMIN,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        vehicles: true,
        activeDriver: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get User by ID
router.get("/:id", async (req: Request<{ id: string }>, res: any) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        vehicles: true,
        activeDriver: {
          include: {
            vehicle: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update User
router.put("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, role } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        role: role as UserRole,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: "User update failed" });
  }
});

// Delete User
router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "User deletion failed" });
  }
});

export const userRoutes = router;
