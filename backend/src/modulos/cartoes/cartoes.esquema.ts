import { z } from "zod";

export const esquemaParametrosIdLista = z.object({
  listId: z.string().uuid()
});

export const esquemaParametrosIdCartao = z.object({
  id: z.string().uuid()
});

export const esquemaCriarCartao = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional()
});

export const esquemaAtualizarCartao = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    coverColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable().optional(),
    archived: z.boolean().optional(),
    position: z.number().int().nonnegative().optional(),
    listId: z.string().uuid().optional()
  })
  .refine(
    (entrada) =>
      entrada.title !== undefined ||
      entrada.description !== undefined ||
      entrada.dueDate !== undefined ||
      entrada.coverColor !== undefined ||
      entrada.archived !== undefined ||
      entrada.position !== undefined ||
      entrada.listId !== undefined,
    {
      message: "Informe pelo menos um campo"
    }
  );

export type EntradaCriarCartao = z.infer<typeof esquemaCriarCartao>;
export type EntradaAtualizarCartao = z.infer<typeof esquemaAtualizarCartao>;
