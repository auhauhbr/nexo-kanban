import type { RequestHandler } from "express";

import { verifyAuthToken } from "../utils/auth-token.js";

export const authMiddleware: RequestHandler = (request, response, next) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401).json({
      message: "Authentication token is required"
    });
    return;
  }

  const token = authorization.slice("Bearer ".length);

  try {
    request.userId = verifyAuthToken(token);
    next();
  } catch {
    response.status(401).json({
      message: "Invalid or expired authentication token"
    });
  }
};
