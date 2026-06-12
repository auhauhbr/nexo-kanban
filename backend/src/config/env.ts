import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z
    .string()
    .url()
    .default("postgresql://kanban:kanban@localhost:5432/kanban?schema=public"),
  JWT_SECRET: z.string().min(16).default("development-secret"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
