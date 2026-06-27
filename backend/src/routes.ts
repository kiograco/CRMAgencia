import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/health", healthRoutes);
