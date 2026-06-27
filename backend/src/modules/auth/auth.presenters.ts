import type { User } from "../../database/models/index.js";

export function presentUser(user: User) {
  return {
    id: user.id,
    companyId: user.companyId,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt
  };
}
