import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { UserRole } from "../../database/models/user.model.js";

export type AccessTokenPayload = {
  sub: string;
  companyId: string;
  role: UserRole;
  email: string;
};

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "8h"
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}
