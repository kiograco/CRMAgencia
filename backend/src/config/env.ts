import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url().default("postgres://crm:crm@127.0.0.1:55432/crm_dev"),
  JWT_ACCESS_SECRET: z.string().min(16).default("change-me-access-secret"),
  JWT_REFRESH_SECRET: z.string().min(16).default("change-me-refresh-secret"),
  COOKIE_SECRET: z.string().min(16).default("change-me-cookie-secret"),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173")
}).superRefine((value, ctx) => {
  if (value.NODE_ENV !== "production") {
    return;
  }

  const unsafeSecrets: Array<[string, string]> = [
    ["JWT_ACCESS_SECRET", value.JWT_ACCESS_SECRET],
    ["JWT_REFRESH_SECRET", value.JWT_REFRESH_SECRET],
    ["COOKIE_SECRET", value.COOKIE_SECRET]
  ];

  for (const [key, secret] of unsafeSecrets) {
    if (secret.startsWith("change-me")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [key],
        message: "Production secrets must be explicitly configured"
      });
    }
  }
});

export const env = envSchema.parse(process.env);
