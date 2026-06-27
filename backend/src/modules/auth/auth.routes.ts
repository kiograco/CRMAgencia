import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { User } from "../../database/models/index.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { writeAuditLog } from "../audit/audit.service.js";
import { ACCESS_TOKEN_COOKIE } from "./auth.constants.js";
import { presentUser } from "./auth.presenters.js";
import { signAccessToken } from "./auth.tokens.js";

export const authRoutes = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  signed: true,
  path: "/",
  maxAge: 8 * 60 * 60 * 1000
};

authRoutes.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const email = input.email.trim().toLowerCase();
    const user = await User.findOne({
      where: {
        email,
        status: "active"
      }
    });

    if (!user) {
      await writeAuditLog({
        req,
        companyId: null,
        userId: null,
        action: "auth.login_failed",
        entity: "user",
        metadata: { email }
      });

      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password"
      });
    }

    const validPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!validPassword) {
      await writeAuditLog({
        req,
        companyId: user.companyId,
        userId: user.id,
        action: "auth.login_failed",
        entity: "user",
        entityId: user.id,
        metadata: { email }
      });

      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password"
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = signAccessToken({
      sub: user.id,
      companyId: user.companyId,
      role: user.role,
      email: user.email
    });

    await writeAuditLog({
      req,
      companyId: user.companyId,
      userId: user.id,
      action: "auth.login",
      entity: "user",
      entityId: user.id,
      metadata: { email: user.email }
    });

    return res.cookie(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions).json({
      user: presentUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

authRoutes.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    await writeAuditLog({
      req,
      companyId: req.user?.companyId ?? null,
      userId: req.user?.id ?? null,
      action: "auth.logout",
      entity: "user",
      entityId: req.user?.id ?? null
    });

    return res.clearCookie(ACCESS_TOKEN_COOKIE, {
      ...cookieOptions,
      maxAge: undefined
    }).status(204).send();
  } catch (error) {
    return next(error);
  }
});

authRoutes.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findOne({
    where: {
      id: req.user?.id,
      companyId: req.user?.companyId,
      status: "active"
    }
  });

  if (!user) {
    return res.status(401).json({
      error: "UNAUTHENTICATED",
      message: "Invalid session"
    });
  }

  return res.json({
    user: presentUser(user)
  });
});
