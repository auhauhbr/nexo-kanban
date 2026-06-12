import { z } from "zod";

export const boardIdParamsSchema = z.object({
  boardId: z.string().uuid()
});

export const listIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createListSchema = z.object({
  title: z.string().trim().min(1).max(100)
});

export const updateListSchema = z
  .object({
    title: z.string().trim().min(1).max(100).optional(),
    position: z.number().int().nonnegative().optional()
  })
  .refine((input) => input.title !== undefined || input.position !== undefined, {
    message: "At least one field must be provided"
  });

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
