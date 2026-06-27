import { Router } from "express";
import { WhereOptions } from "sequelize";
import { Contact, Deal, User } from "../../database/models/index.js";
import type { Deal as DealModel } from "../../database/models/deal.model.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { writeAuditLog } from "../audit/audit.service.js";
import { presentDeal } from "./deal.presenters.js";
import {
  createDealSchema,
  listDealsQuerySchema,
  moveDealStageSchema,
  updateDealSchema
} from "./deal.schemas.js";

export const dealRoutes = Router();

dealRoutes.use(authMiddleware);

async function contactBelongsToCompany(contactId: string, companyId: string) {
  return Contact.findOne({
    where: {
      id: contactId,
      companyId
    }
  });
}

async function ownerBelongsToCompany(ownerId: string | null | undefined, companyId: string) {
  if (!ownerId) {
    return true;
  }

  const owner = await User.findOne({
    where: {
      id: ownerId,
      companyId,
      status: "active"
    }
  });

  return Boolean(owner);
}

function inferStatusFromStage(stage: string, fallback: "open" | "won" | "lost") {
  if (stage === "won") {
    return "won";
  }

  if (stage === "lost") {
    return "lost";
  }

  return fallback;
}

dealRoutes.get("/", async (req, res, next) => {
  try {
    const query = listDealsQuerySchema.parse(req.query);
    const where: WhereOptions<DealModel> = {
      companyId: req.user!.companyId
    };

    if (query.stage) {
      where.stage = query.stage;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.contactId) {
      where.contactId = query.contactId;
    }

    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }

    const { rows, count } = await Deal.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: query.limit,
      offset: query.offset
    });

    return res.json({
      data: rows.map(presentDeal),
      pagination: {
        total: count,
        limit: query.limit,
        offset: query.offset
      }
    });
  } catch (error) {
    return next(error);
  }
});

dealRoutes.post("/", async (req, res, next) => {
  try {
    const input = createDealSchema.parse(req.body);
    const contact = await contactBelongsToCompany(input.contactId, req.user!.companyId);

    if (!contact) {
      return res.status(400).json({
        error: "INVALID_CONTACT",
        message: "Contact does not belong to this company"
      });
    }

    const validOwner = await ownerBelongsToCompany(input.ownerId, req.user!.companyId);

    if (!validOwner) {
      return res.status(400).json({
        error: "INVALID_OWNER",
        message: "Owner does not belong to this company"
      });
    }

    const deal = await Deal.create({
      ...input,
      status: inferStatusFromStage(input.stage, input.status),
      companyId: req.user!.companyId
    });

    await writeAuditLog({
      req,
      companyId: req.user!.companyId,
      userId: req.user!.id,
      action: "deal.create",
      entity: "deal",
      entityId: deal.id,
      metadata: { dealId: deal.id, contactId: deal.contactId }
    });

    return res.status(201).json({
      deal: presentDeal(deal)
    });
  } catch (error) {
    return next(error);
  }
});

dealRoutes.get("/:id", async (req, res, next) => {
  try {
    const deal = await Deal.findOne({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!deal) {
      return res.status(404).json({
        error: "DEAL_NOT_FOUND",
        message: "Deal not found"
      });
    }

    return res.json({
      deal: presentDeal(deal)
    });
  } catch (error) {
    return next(error);
  }
});

dealRoutes.patch("/:id", async (req, res, next) => {
  try {
    const input = updateDealSchema.parse(req.body);
    const deal = await Deal.findOne({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!deal) {
      return res.status(404).json({
        error: "DEAL_NOT_FOUND",
        message: "Deal not found"
      });
    }

    const validOwner = await ownerBelongsToCompany(input.ownerId, req.user!.companyId);

    if (!validOwner) {
      return res.status(400).json({
        error: "INVALID_OWNER",
        message: "Owner does not belong to this company"
      });
    }

    await deal.update({
      ...input,
      status: input.stage ? inferStatusFromStage(input.stage, input.status ?? deal.status) : input.status
    });

    await writeAuditLog({
      req,
      companyId: req.user!.companyId,
      userId: req.user!.id,
      action: "deal.update",
      entity: "deal",
      entityId: deal.id,
      metadata: { dealId: deal.id, fields: Object.keys(input) }
    });

    return res.json({
      deal: presentDeal(deal)
    });
  } catch (error) {
    return next(error);
  }
});

dealRoutes.patch("/:id/stage", async (req, res, next) => {
  try {
    const input = moveDealStageSchema.parse(req.body);
    const deal = await Deal.findOne({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!deal) {
      return res.status(404).json({
        error: "DEAL_NOT_FOUND",
        message: "Deal not found"
      });
    }

    const previousStage = deal.stage;
    await deal.update({
      stage: input.stage,
      status: inferStatusFromStage(input.stage, deal.status)
    });

    await writeAuditLog({
      req,
      companyId: req.user!.companyId,
      userId: req.user!.id,
      action: "deal.move_stage",
      entity: "deal",
      entityId: deal.id,
      metadata: { dealId: deal.id, from: previousStage, to: input.stage }
    });

    return res.json({
      deal: presentDeal(deal)
    });
  } catch (error) {
    return next(error);
  }
});

dealRoutes.delete("/:id", async (req, res, next) => {
  try {
    const deal = await Deal.findOne({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!deal) {
      return res.status(404).json({
        error: "DEAL_NOT_FOUND",
        message: "Deal not found"
      });
    }

    await deal.destroy();

    await writeAuditLog({
      req,
      companyId: req.user!.companyId,
      userId: req.user!.id,
      action: "deal.delete",
      entity: "deal",
      entityId: deal.id,
      metadata: { dealId: deal.id }
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});
