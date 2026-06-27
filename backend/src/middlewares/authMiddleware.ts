import type { RequestHandler } from "express";
import { User } from "../database/models/index.js";
import { ACCESS_TOKEN_COOKIE } from "../modules/auth/auth.constants.js";
import { verifyAccessToken } from "../modules/auth/auth.tokens.js";

export const authMiddleware: RequestHandler = async (req, res, next) => {
  const token = req.signedCookies?.[ACCESS_TOKEN_COOKIE] as string | undefined;

  if (!token) {
    return res.status(401).json({
      error: "UNAUTHENTICATED",
      message: "Authentication required"
    });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findOne({
      where: {
        id: payload.sub,
        companyId: payload.companyId,
        status: "active"
      }
    });

    if (!user) {
      return res.status(401).json({
        error: "UNAUTHENTICATED",
        message: "Invalid session"
      });
    }

    req.user = {
      id: user.id,
      companyId: user.companyId,
      role: user.role,
      email: user.email,
      name: user.name
    };

    return next();
  } catch {
    return res.status(401).json({
      error: "UNAUTHENTICATED",
      message: "Invalid session"
    });
  }
};
