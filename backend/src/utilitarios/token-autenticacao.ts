import jwt from "jsonwebtoken";
import { z } from "zod";

import { ambiente } from "../configuracao/ambiente.js";

const esquemaDadosToken = z.object({
  sub: z.string().uuid()
});

export const verificarTokenAutenticacao = (token: string) => {
  const dadosToken = esquemaDadosToken.parse(
    jwt.verify(token, ambiente.JWT_SECRET)
  );
  return dadosToken.sub;
};
