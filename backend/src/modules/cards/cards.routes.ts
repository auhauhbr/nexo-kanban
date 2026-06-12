import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  deleteCardController,
  updateCardController
} from "./cards.controller.js";

export const cardsRoutes = Router();

cardsRoutes.use(authMiddleware);
cardsRoutes.patch("/:id", updateCardController);
cardsRoutes.delete("/:id", deleteCardController);
