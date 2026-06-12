import { Router } from "express";

import { prisma } from "../config/prisma.js";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { boardsRoutes } from "../modules/boards/boards.routes.js";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/boards", boardsRoutes);

routes.get("/health", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    response.status(200).json({
      status: "ok",
      service: "kanban-api",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    response.status(503).json({
      status: "error",
      service: "kanban-api",
      database: "disconnected",
      timestamp: new Date().toISOString()
    });
  }
});
