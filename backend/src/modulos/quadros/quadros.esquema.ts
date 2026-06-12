import { z } from "zod";

export const esquemaParametrosIdQuadro = z.object({
  id: z.string().uuid()
});

export const esquemaCriarQuadro = z.object({
  title: z.string().trim().min(1).max(100)
});

export const esquemaAtualizarQuadro = esquemaCriarQuadro;

export type EntradaCriarQuadro = z.infer<typeof esquemaCriarQuadro>;
export type EntradaAtualizarQuadro = z.infer<typeof esquemaAtualizarQuadro>;
