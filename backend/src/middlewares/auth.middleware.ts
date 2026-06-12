import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../config/env.js";

const tokenPayloadSchema = z.object({
  sub: z.string().uuid()
});

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
    const payload = tokenPayloadSchema.parse(jwt.verify(token, env.JWT_SECRET));
    request.userId = payload.sub;
    next();
  } catch {
    response.status(401).json({
      message: "Invalid or expired authentication token"
    });
  }
};
