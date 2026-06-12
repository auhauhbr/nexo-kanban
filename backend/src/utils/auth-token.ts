import jwt from "jsonwebtoken";
import { z } from "zod";

import { env } from "../config/env.js";

const tokenPayloadSchema = z.object({
  sub: z.string().uuid()
});

export const verifyAuthToken = (token: string) => {
  const payload = tokenPayloadSchema.parse(jwt.verify(token, env.JWT_SECRET));
  return payload.sub;
};
