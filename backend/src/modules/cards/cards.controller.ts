import type { RequestHandler } from "express";

import { emitBoardEvent } from "../../sockets/index.js";
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
  const { card, boardId } = await createCard(
    request.userId,
    listId,
    createCardSchema.parse(request.body)
  );
  emitBoardEvent(boardId, "card:created", { card });
  response.status(201).json({ card });
};

export const updateCardController: RequestHandler = async (
  request,
  response
) => {
  const { id } = cardIdParamsSchema.parse(request.params);
  const { card, boardId } = await updateCard(
    request.userId,
    id,
    updateCardSchema.parse(request.body)
  );
  emitBoardEvent(boardId, "card:updated", { card });
  response.status(200).json({ card });
};

export const deleteCardController: RequestHandler = async (
  request,
  response
) => {
  const { id } = cardIdParamsSchema.parse(request.params);
  const boardId = await deleteCard(request.userId, id);
  emitBoardEvent(boardId, "card:deleted", { cardId: id });
  response.status(204).send();
};
