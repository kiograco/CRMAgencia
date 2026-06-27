import { Router } from "express";
import { Op, WhereOptions } from "sequelize";
import { Contact } from "../../database/models/index.js";
import type { Contact as ContactModel } from "../../database/models/contact.model.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { writeAuditLog } from "../audit/audit.service.js";
import { presentContact } from "./contact.presenters.js";
import {
  createContactSchema,
  listContactsQuerySchema,
  updateContactSchema
} from "./contact.schemas.js";

export const contactRoutes = Router();

contactRoutes.use(authMiddleware);

contactRoutes.get("/", async (req, res, next) => {
  try {
    const query = listContactsQuerySchema.parse(req.query);
    const where: WhereOptions<ContactModel> = {
      companyId: req.user!.companyId
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where[Op.or as keyof WhereOptions<ContactModel>] = [
        { name: { [Op.iLike]: `%${query.search}%` } },
        { email: { [Op.iLike]: `%${query.search}%` } },
        { phone: { [Op.iLike]: `%${query.search}%` } }
      ] as never;
    }

    const { rows, count } = await Contact.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: query.limit,
      offset: query.offset
    });

    return res.json({
      data: rows.map(presentContact),
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

contactRoutes.post("/", async (req, res, next) => {
  try {
    const input = createContactSchema.parse(req.body);
    const contact = await Contact.create({
      ...input,
      companyId: req.user!.companyId
    });

    await writeAuditLog({
      req,
      companyId: req.user!.companyId,
      userId: req.user!.id,
      action: "contact.create",
      entity: "contact",
      entityId: contact.id,
      metadata: { contactId: contact.id }
    });

    return res.status(201).json({
      contact: presentContact(contact)
    });
  } catch (error) {
    return next(error);
  }
});

contactRoutes.get("/:id", async (req, res, next) => {
  try {
    const contact = await Contact.findOne({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!contact) {
      return res.status(404).json({
        error: "CONTACT_NOT_FOUND",
        message: "Contact not found"
      });
    }

    return res.json({
      contact: presentContact(contact)
    });
  } catch (error) {
    return next(error);
  }
});

contactRoutes.patch("/:id", async (req, res, next) => {
  try {
    const input = updateContactSchema.parse(req.body);
    const contact = await Contact.findOne({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!contact) {
      return res.status(404).json({
        error: "CONTACT_NOT_FOUND",
        message: "Contact not found"
      });
    }

    await contact.update(input);

    await writeAuditLog({
      req,
      companyId: req.user!.companyId,
      userId: req.user!.id,
      action: "contact.update",
      entity: "contact",
      entityId: contact.id,
      metadata: { contactId: contact.id, fields: Object.keys(input) }
    });

    return res.json({
      contact: presentContact(contact)
    });
  } catch (error) {
    return next(error);
  }
});

contactRoutes.delete("/:id", async (req, res, next) => {
  try {
    const contact = await Contact.findOne({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId
      }
    });

    if (!contact) {
      return res.status(404).json({
        error: "CONTACT_NOT_FOUND",
        message: "Contact not found"
      });
    }

    await contact.destroy();

    await writeAuditLog({
      req,
      companyId: req.user!.companyId,
      userId: req.user!.id,
      action: "contact.delete",
      entity: "contact",
      entityId: contact.id,
      metadata: { contactId: contact.id }
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});
