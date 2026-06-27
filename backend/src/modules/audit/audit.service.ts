import type { Request } from "express";
import { AuditLog } from "../../database/models/index.js";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "secret"
]);

function sanitizeMetadata(metadata: Record<string, unknown> | undefined) {
  if (!metadata) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !SENSITIVE_KEYS.has(key))
  );
}

type AuditInput = {
  req?: Request;
  companyId: string | null;
  userId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(input: AuditInput) {
  await AuditLog.create({
    companyId: input.companyId,
    userId: input.userId,
    action: input.action,
    entity: input.entity,
    entityId: input.entityId ?? null,
    metadata: sanitizeMetadata(input.metadata),
    ipAddress: input.req?.ip ?? null,
    userAgent: input.req?.get("user-agent") ?? null
  });
}
