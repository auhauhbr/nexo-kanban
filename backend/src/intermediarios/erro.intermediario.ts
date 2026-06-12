import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { ErroAplicacao } from "../utilitarios/erro-aplicacao.js";

export const intermediarioDeErros: ErrorRequestHandler = (
  erro,
  _requisicao,
  resposta,
  _proximo
) => {
  if (erro instanceof ErroAplicacao) {
    resposta.status(erro.statusCode).json({
      message: erro.message
    });
    return;
  }

  if (erro instanceof ZodError) {
    resposta.status(400).json({
      message: "Dados da requisição inválidos",
      issues: erro.flatten().fieldErrors
    });
    return;
  }

  console.error(erro);
  resposta.status(500).json({
    message: "Erro interno do servidor"
  });
};
