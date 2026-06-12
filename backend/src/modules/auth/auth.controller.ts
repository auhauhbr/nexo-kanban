import type { RequestHandler } from "express";

import { loginSchema, registerSchema } from "./auth.schema.js";
import { getCurrentUser, login, register } from "./auth.service.js";

export const registerController: RequestHandler = async (request, response) => {
  const result = await register(registerSchema.parse(request.body));
  response.status(201).json(result);
};

export const loginController: RequestHandler = async (request, response) => {
  const result = await login(loginSchema.parse(request.body));
  response.status(200).json(result);
};

export const meController: RequestHandler = async (request, response) => {
  const user = await getCurrentUser(request.userId);
  response.status(200).json({ user });
};
