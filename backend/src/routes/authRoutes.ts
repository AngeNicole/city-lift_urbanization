import { Router, Request } from "express";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// Register and return token
router.post("/register", async (req: Request, res: any) => {
    const { name, email, password, phone, role, driveRequest } = req.body;
    try {
     const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
        }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          driveRequest,
          role: role as UserRole,
        },
      });
      const token = jwt.sign(
        { 
        userId: user.id, role: user.role }, 
        process.env.JWT_SECRET as string, 
        { expiresIn: "30d" }
      );
      res.status(201).json({ token });
    } catch (error) {
      res.status(400).json({ error: "User registration failed" });
    }
  });

// User Login
router.post("/login", async (req: Request, res: any) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
        {   
            userId: user.id, 
            role: user.role 
        }, 
        process.env.JWT_SECRET as string, 
        { expiresIn: "30d" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

  
  // Get profile
  router.get("/profile", authenticate, async (req: Request, res: any) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: (req as any).user.id } });
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });
  

router.post("/change-password", async (req: Request, res: any) => {
    const { email, oldPassword, newPassword } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { email }, data: { password: hashedNewPassword } });
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Password update failed" });
    }
  });

export const authRoutes = router;
