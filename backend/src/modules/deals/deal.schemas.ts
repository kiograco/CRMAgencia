import { z } from "zod";

export const dealStageSchema = z.enum([
  "new_interest",
  "in_service",
  "proposal_sent",
  "waiting_customer",
  "negotiation",
  "won",
  "lost"
]);

export const dealStatusSchema = z.enum(["open", "won", "lost"]);

const nullableText = z.string().trim().min(1).max(255).nullable().optional();

export const createDealSchema = z.object({
  contactId: z.string().uuid(),
  ownerId: z.string().uuid().nullable().optional(),
  stage: dealStageSchema.default("new_interest"),
  title: z.string().trim().min(2).max(180),
  destination: z.string().trim().min(1).max(120).nullable().optional(),
  value: z.number().min(0).default(0),
  probability: z.number().int().min(0).max(100).default(0),
  nextAction: nullableText,
  expectedCloseAt: z.coerce.date().nullable().optional(),
  status: dealStatusSchema.default("open")
});

export const updateDealSchema = createDealSchema
  .omit({ contactId: true })
  .partial();

export const moveDealStageSchema = z.object({
  stage: dealStageSchema
});

export const listDealsQuerySchema = z.object({
  stage: dealStageSchema.optional(),
  status: dealStatusSchema.optional(),
  contactId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});
