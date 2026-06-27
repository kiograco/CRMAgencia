import type { UserRole } from "../database/models/user.model.js";

declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: string;
      companyId: string;
      role: UserRole;
      email: string;
      name: string;
    }

    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
