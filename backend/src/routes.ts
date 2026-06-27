import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { contactRoutes } from "./modules/contacts/contact.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/contacts", contactRoutes);
routes.use("/health", healthRoutes);
