import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../utils/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Invalid request data",
      issues: error.flatten().fieldErrors
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    message: "Internal server error"
  });
};
