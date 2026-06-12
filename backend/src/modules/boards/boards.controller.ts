import type { RequestHandler } from "express";

import { emitBoardEvent } from "../../sockets/index.js";
import {
  boardIdParamsSchema,
  createBoardSchema,
  updateBoardSchema
} from "./boards.schema.js";
import {
  createBoard,
  deleteBoard,
  getBoard,
  listBoards,
  updateBoard
} from "./boards.service.js";

export const listBoardsController: RequestHandler = async (
  request,
  response
) => {
  const boards = await listBoards(request.userId);
  response.status(200).json({ boards });
};

export const createBoardController: RequestHandler = async (
  request,
  response
) => {
  const board = await createBoard(
    request.userId,
    createBoardSchema.parse(request.body)
  );
  response.status(201).json({ board });
};

export const getBoardController: RequestHandler = async (request, response) => {
  const { id } = boardIdParamsSchema.parse(request.params);
  const board = await getBoard(request.userId, id);
  response.status(200).json({ board });
};

export const updateBoardController: RequestHandler = async (
  request,
  response
) => {
  const { id } = boardIdParamsSchema.parse(request.params);
  const board = await updateBoard(
    request.userId,
    id,
    updateBoardSchema.parse(request.body)
  );
  emitBoardEvent(board.id, "board:changed", { board });
  response.status(200).json({ board });
};

export const deleteBoardController: RequestHandler = async (
  request,
  response
) => {
  const { id } = boardIdParamsSchema.parse(request.params);
  await deleteBoard(request.userId, id);
  emitBoardEvent(id, "board:deleted", { boardId: id });
  response.status(204).send();
};
