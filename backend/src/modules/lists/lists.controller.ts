import type { RequestHandler } from "express";

import {
  boardIdParamsSchema,
  createListSchema,
  listIdParamsSchema,
  updateListSchema
} from "./lists.schema.js";
import { createList, deleteList, updateList } from "./lists.service.js";

export const createListController: RequestHandler = async (
  request,
  response
) => {
  const { boardId } = boardIdParamsSchema.parse(request.params);
  const list = await createList(
    request.userId,
    boardId,
    createListSchema.parse(request.body)
  );
  response.status(201).json({ list });
};

export const updateListController: RequestHandler = async (
  request,
  response
) => {
  const { id } = listIdParamsSchema.parse(request.params);
  const list = await updateList(
    request.userId,
    id,
    updateListSchema.parse(request.body)
  );
  response.status(200).json({ list });
};

export const deleteListController: RequestHandler = async (
  request,
  response
) => {
  const { id } = listIdParamsSchema.parse(request.params);
  await deleteList(request.userId, id);
  response.status(204).send();
};
