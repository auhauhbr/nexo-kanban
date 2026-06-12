import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true
} as const;

const createToken = (userId: string) =>
  jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    expiresIn: "7d"
  });

export const register = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true }
  });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const password = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password
    },
    select: publicUserSelect
  });

  return {
    user,
    token: createToken(user.id)
  };
};

export const login = async (input: LoginInput) => {
  const userWithPassword = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (!userWithPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    userWithPassword.password
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const { password: _password, ...user } = userWithPassword;

  return {
    user,
    token: createToken(user.id)
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
