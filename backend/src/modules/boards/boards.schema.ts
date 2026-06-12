import { z } from "zod";

export const boardIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createBoardSchema = z.object({
  title: z.string().trim().min(1).max(100)
});

export const updateBoardSchema = createBoardSchema;

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
