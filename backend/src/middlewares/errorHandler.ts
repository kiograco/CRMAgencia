import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      issues: error.issues.map((issue) => ({
        path: issue.path,
        message: issue.message
      }))
    });
  }

  const status = typeof error.status === "number" ? error.status : 500;

  return res.status(status).json({
    error: status === 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR",
    message: status === 500 ? "Unexpected server error" : error.message
  });
};
