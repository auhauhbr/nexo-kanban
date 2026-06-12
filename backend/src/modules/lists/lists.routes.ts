import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  deleteListController,
  updateListController
} from "./lists.controller.js";
import { createCardController } from "../cards/cards.controller.js";

export const listsRoutes = Router();

listsRoutes.use(authMiddleware);
listsRoutes.post("/:listId/cards", createCardController);
listsRoutes.patch("/:id", updateListController);
listsRoutes.delete("/:id", deleteListController);
