import { z } from "zod";

export const contactStatusSchema = z.enum([
  "very_hot",
  "hot",
  "warm",
  "cold",
  "lost",
  "returning_customer",
  "waiting_response"
]);

const nullableText = z.string().trim().min(1).max(255).nullable().optional();

export const createContactSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(180).nullable().optional(),
  phone: z.string().trim().min(6).max(40).nullable().optional(),
  status: contactStatusSchema.default("warm"),
  score: z.number().int().min(0).max(100).default(0),
  interest: nullableText,
  nextTrip: z.string().trim().min(1).max(80).nullable().optional(),
  consultantId: z.string().uuid().nullable().optional()
});

export const updateContactSchema = createContactSchema.partial();

export const listContactsQuerySchema = z.object({
  status: contactStatusSchema.optional(),
  search: z.string().trim().min(1).max(80).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});
