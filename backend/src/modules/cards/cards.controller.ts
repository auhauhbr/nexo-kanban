import type { RequestHandler } from "express";

import {
  cardIdParamsSchema,
  createCardSchema,
  listIdParamsSchema,
  updateCardSchema
} from "./cards.schema.js";
import { createCard, deleteCard, updateCard } from "./cards.service.js";

export const createCardController: RequestHandler = async (
  request,
  response
) => {
  const { listId } = listIdParamsSchema.parse(request.params);
  const card = await createCard(
    request.userId,
    listId,
    createCardSchema.parse(request.body)
  );
  response.status(201).json({ card });
};

export const updateCardController: RequestHandler = async (
  request,
  response
) => {
  const { id } = cardIdParamsSchema.parse(request.params);
  const card = await updateCard(
    request.userId,
    id,
    updateCardSchema.parse(request.body)
  );
  response.status(200).json({ card });
};

export const deleteCardController: RequestHandler = async (
  request,
  response
) => {
  const { id } = cardIdParamsSchema.parse(request.params);
  await deleteCard(request.userId, id);
  response.status(204).send();
};
