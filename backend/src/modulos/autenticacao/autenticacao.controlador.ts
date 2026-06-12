import type { RequestHandler } from "express";

import { esquemaEntrada, esquemaCadastro } from "./autenticacao.esquema.js";
import {
  buscarUsuarioAtual,
  cadastrarUsuario,
  entrarUsuario
} from "./autenticacao.servico.js";

export const controladorCadastro: RequestHandler = async (requisicao, resposta) => {
  const resultado = await cadastrarUsuario(esquemaCadastro.parse(requisicao.body));
  resposta.status(201).json(resultado);
};

export const controladorEntrada: RequestHandler = async (requisicao, resposta) => {
  const resultado = await entrarUsuario(esquemaEntrada.parse(requisicao.body));
  resposta.status(200).json(resultado);
};

export const controladorUsuarioAtual: RequestHandler = async (requisicao, resposta) => {
  const usuario = await buscarUsuarioAtual(requisicao.idUsuario);
  resposta.status(200).json({ user: usuario });
};
