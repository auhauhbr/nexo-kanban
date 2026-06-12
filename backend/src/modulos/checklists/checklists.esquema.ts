import { z } from "zod";

export const esquemaParametrosCartaoChecklist = z.object({
  cardId: z.string().uuid()
});

export const esquemaParametrosChecklist = z.object({
  id: z.string().uuid()
});

export const esquemaParametrosItensChecklist = z.object({
  checklistId: z.string().uuid()
});

export const esquemaParametrosItemChecklist = z.object({
  id: z.string().uuid()
});

export const esquemaCriarChecklist = z.object({
  title: z.string().trim().min(1).max(100)
});

export const esquemaCriarItemChecklist = z.object({
  text: z.string().trim().min(1).max(300)
});

export const esquemaAtualizarItemChecklist = z
  .object({
    text: z.string().trim().min(1).max(300).optional(),
    done: z.boolean().optional()
  })
  .refine((entrada) => entrada.text !== undefined || entrada.done !== undefined, {
    message: "Informe pelo menos um campo"
  });

export type EntradaCriarChecklist = z.infer<typeof esquemaCriarChecklist>;
export type EntradaCriarItemChecklist = z.infer<typeof esquemaCriarItemChecklist>;
export type EntradaAtualizarItemChecklist = z.infer<typeof esquemaAtualizarItemChecklist>;
