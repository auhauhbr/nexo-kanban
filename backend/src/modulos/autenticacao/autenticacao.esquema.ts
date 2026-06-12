import { z } from "zod";

export const esquemaCadastro = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(72)
});

export const esquemaEntrada = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1)
});

export type EntradaCadastro = z.infer<typeof esquemaCadastro>;
export type EntradaLogin = z.infer<typeof esquemaEntrada>;
