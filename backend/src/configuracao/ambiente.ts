import "dotenv/config";

import { z } from "zod";

const esquemaAmbiente = z.object({
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

const ambienteValidado = esquemaAmbiente.safeParse(process.env);

if (!ambienteValidado.success) {
  console.error(
    "Variáveis de ambiente inválidas:",
    ambienteValidado.error.flatten().fieldErrors
  );
  process.exit(1);
}

if (
  ambienteValidado.data.NODE_ENV === "production" &&
  !process.env.JWT_SECRET
) {
  console.error("JWT_SECRET é obrigatório em ambiente de produção.");
  process.exit(1);
}

export const ambiente = ambienteValidado.data;
