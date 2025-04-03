
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access Forbidden: Admins Only" });
    }
    next();
  };

  export const authenticate = (req: Request, res: any, next: NextFunction) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access Denied: No token provided" });
    }
  
    const token = authHeader.split(" ")[1];
    try {
      const verified = jwt.verify(
        token, 
        process.env.JWT_SECRET as string) as { userId: string, role: string };
      (req as any).user = { 
        id: verified.userId,
        role: verified.role
      };
      next();
    } catch (error) {
      res.status(401).json({ error: "Invalid Token" });
    }
  };