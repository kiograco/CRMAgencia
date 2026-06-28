import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { corsOrigins, env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { routes } from "./routes.js";

export const app = express();

function isLocalDevelopmentOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

export function isAllowedCorsOrigin(origin: string | undefined) {
  if (!origin) {
    return true;
  }

  if (corsOrigins.includes(origin)) {
    return true;
  }

  return env.NODE_ENV !== "production" && isLocalDevelopmentOrigin(origin);
}

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedCorsOrigin(origin));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser(env.COOKIE_SECRET));

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);
