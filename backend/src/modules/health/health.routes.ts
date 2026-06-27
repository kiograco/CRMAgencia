import { Router } from "express";

export const healthRoutes = Router();

healthRoutes.get("/", (_req, res) => {
  return res.json({
    status: "ok",
    service: "cruise-crm-backend"
  });
});
