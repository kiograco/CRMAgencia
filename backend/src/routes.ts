import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { contactRoutes } from "./modules/contacts/contact.routes.js";
import { dealRoutes } from "./modules/deals/deal.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/contacts", contactRoutes);
routes.use("/deals", dealRoutes);
routes.use("/health", healthRoutes);
