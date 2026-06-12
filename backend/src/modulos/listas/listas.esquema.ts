import { z } from "zod";

export const esquemaParametrosIdQuadro = z.object({
  boardId: z.string().uuid()
});

export const esquemaParametrosIdLista = z.object({
  id: z.string().uuid()
});

export const esquemaCriarLista = z.object({
  title: z.string().trim().min(1).max(100)
});

export const esquemaAtualizarLista = z
  .object({
    title: z.string().trim().min(1).max(100).optional(),
    position: z.number().int().nonnegative().optional(),
    archived: z.boolean().optional(),
    wipLimit: z.number().int().positive().nullable().optional()
  })
  .refine(
    (entrada) =>
      entrada.title !== undefined ||
      entrada.position !== undefined ||
      entrada.archived !== undefined ||
      entrada.wipLimit !== undefined,
    { message: "Informe pelo menos um campo" }
  );

export type EntradaCriarLista = z.infer<typeof esquemaCriarLista>;
export type EntradaAtualizarLista = z.infer<typeof esquemaAtualizarLista>;
