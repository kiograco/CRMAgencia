import { Router } from "express";
import { Contact, Deal } from "../../database/models/index.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

export const dashboardRoutes = Router();

dashboardRoutes.use(authMiddleware);

dashboardRoutes.get("/summary", async (req, res, next) => {
  try {
    const companyId = req.user!.companyId;
    const [totalContacts, hotContacts, deals] = await Promise.all([
      Contact.count({ where: { companyId } }),
      Contact.count({ where: { companyId, status: ["very_hot", "hot"] } }),
      Deal.findAll({ where: { companyId } })
    ]);

    const openDeals = deals.filter((deal) => deal.status === "open");
    const wonDeals = deals.filter((deal) => deal.status === "won");
    const lostDeals = deals.filter((deal) => deal.status === "lost");
    const pipelineValue = openDeals.reduce((total, deal) => total + Number(deal.value), 0);
    const expectedRevenue = openDeals.reduce(
      (total, deal) => total + Number(deal.value) * (deal.probability / 100),
      0
    );
    const closedDeals = wonDeals.length + lostDeals.length;
    const conversionRate = closedDeals > 0 ? (wonDeals.length / closedDeals) * 100 : 0;

    return res.json({
      summary: {
        totalContacts,
        hotContacts,
        activeDeals: openDeals.length,
        wonDeals: wonDeals.length,
        lostDeals: lostDeals.length,
        pipelineValue,
        expectedRevenue,
        conversionRate
      }
    });
  } catch (error) {
    return next(error);
  }
});
