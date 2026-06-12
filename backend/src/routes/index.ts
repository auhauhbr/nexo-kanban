import { Router } from "express";

export const routes = Router();

routes.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "kanban-api",
    timestamp: new Date().toISOString()
  });
});
