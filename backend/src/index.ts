import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userRoutes } from "./routes/userRoutes";
import { vehicleRoutes } from "./routes/vehicleRoutes";
import { rideRoutes } from "./routes/rideRoutes";
import { paymentRoutes } from "./routes/paymentRoutes";
import { authRoutes } from "./routes/authRoutes";
import { authenticate } from "./middleware/authMiddleware";
import { vehicleDriverRoutes } from "./routes/vehicleDriverRoutes";


dotenv.config();
const app: Application = express();

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to CityLift Connect");
});
app.use("/api/auth", authRoutes);
app.use("/api/users",authenticate,userRoutes);
app.use("/api/vehicles",authenticate,vehicleRoutes);
app.use("/api/vehicles/driver",authenticate,vehicleDriverRoutes);
app.use("/api/rides",authenticate,rideRoutes);
app.use("/api/payments",authenticate,paymentRoutes);



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));