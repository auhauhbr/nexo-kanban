import { z } from "zod";

export const esquemaIdCartaoInteracao = z.object({ cardId: z.string().uuid() });
export const esquemaIdAnexo = z.object({ id: z.string().uuid() });
export const esquemaComentario = z.object({
  message: z.string().trim().min(1).max(2000)
});
export const esquemaAnexo = z.object({
  title: z.string().trim().min(1).max(120),
  url: z.string().url().max(2000)
});
