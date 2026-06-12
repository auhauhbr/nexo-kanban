import { Router } from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  loginController,
  meController,
  registerController
} from "./auth.controller.js";

export const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.get("/me", authMiddleware, meController);
