import { z } from "zod";

export const esquemaCadastro = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(12, "A senha deve ter pelo menos 12 caracteres")
    .max(72)
    .regex(/[a-zà-ÿ]/, "A senha deve conter uma letra minúscula")
    .regex(/[A-ZÀ-Þ]/, "A senha deve conter uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter um número")
    .regex(/[^A-Za-zÀ-ÿ0-9\s]/, "A senha deve conter um caractere especial")
    .refine((senha) => !/(.)\1{3}/i.test(senha), {
      message: "A senha não pode repetir o mesmo caractere 4 vezes seguidas"
    })
});

export const esquemaEntrada = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1)
});

export type EntradaCadastro = z.infer<typeof esquemaCadastro>;
export type EntradaLogin = z.infer<typeof esquemaEntrada>;
