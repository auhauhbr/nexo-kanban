import { z } from "zod";

export const esquemaIdQuadroArquivados = z.object({ id: z.string().uuid() });
export const esquemaIdListaArquivada = z.object({ id: z.string().uuid() });
export const esquemaIdCartaoArquivado = z.object({ id: z.string().uuid() });
export const esquemaRestaurarCartao = z.object({
  listId: z.string().uuid().optional()
});
