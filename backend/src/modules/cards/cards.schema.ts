import { z } from "zod";

export const listIdParamsSchema = z.object({
  listId: z.string().uuid()
});

export const cardIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createCardSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional()
});

export const updateCardSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(5000).nullable().optional(),
    position: z.number().int().nonnegative().optional(),
    listId: z.string().uuid().optional()
  })
  .refine(
    (input) =>
      input.title !== undefined ||
      input.description !== undefined ||
      input.position !== undefined ||
      input.listId !== undefined,
    {
      message: "At least one field must be provided"
    }
  );

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
