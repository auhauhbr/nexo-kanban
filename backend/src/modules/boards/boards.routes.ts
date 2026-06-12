import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  createBoardController,
  deleteBoardController,
  getBoardController,
  listBoardsController,
  updateBoardController
} from "./boards.controller.js";
import { createListController } from "../lists/lists.controller.js";

export const boardsRoutes = Router();

boardsRoutes.use(authMiddleware);
boardsRoutes.get("/", listBoardsController);
boardsRoutes.post("/", createBoardController);
boardsRoutes.post("/:boardId/lists", createListController);
boardsRoutes.get("/:id", getBoardController);
boardsRoutes.patch("/:id", updateBoardController);
boardsRoutes.delete("/:id", deleteBoardController);
