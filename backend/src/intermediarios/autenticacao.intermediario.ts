import type { RequestHandler } from "express";

import { verificarTokenAutenticacao } from "../utilitarios/token-autenticacao.js";

export const intermediarioDeAutenticacao: RequestHandler = (requisicao, resposta, proximo) => {
  const authorization = requisicao.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    resposta.status(401).json({
      message: "O token de autenticação é obrigatório"
    });
    return;
  }

  const token = authorization.slice("Bearer ".length);

  try {
    requisicao.idUsuario = verificarTokenAutenticacao(token);
    proximo();
  } catch {
    resposta.status(401).json({
      message: "Token de autenticação inválido ou expirado"
    });
  }
};
