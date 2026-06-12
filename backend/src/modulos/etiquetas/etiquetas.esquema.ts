import { z } from "zod";

export const esquemaParametrosEtiqueta = z.object({
  id: z.string().uuid()
});

export const esquemaParametrosQuadroEtiqueta = z.object({
  boardId: z.string().uuid()
});

export const esquemaParametrosCartaoEtiqueta = z.object({
  cardId: z.string().uuid(),
  labelId: z.string().uuid()
});

export const esquemaCriarEtiqueta = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/)
});

export const esquemaAtualizarEtiqueta = esquemaCriarEtiqueta.partial().refine(
  (entrada) => entrada.name !== undefined || entrada.color !== undefined,
  { message: "Informe pelo menos um campo" }
);

export type EntradaCriarEtiqueta = z.infer<typeof esquemaCriarEtiqueta>;
export type EntradaAtualizarEtiqueta = z.infer<typeof esquemaAtualizarEtiqueta>;
