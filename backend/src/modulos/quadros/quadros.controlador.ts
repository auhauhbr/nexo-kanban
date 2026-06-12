import type { RequestHandler } from "express";

import { emitirEventoDoQuadro } from "../../tempo-real/index.js";
import {
  esquemaParametrosIdQuadro,
  esquemaCriarQuadro,
  esquemaAtualizarQuadro
} from "./quadros.esquema.js";
import {
  criarQuadro,
  excluirQuadro,
  buscarQuadro,
  listarQuadros,
  atualizarQuadro
} from "./quadros.servico.js";

export const controladorListarQuadros: RequestHandler = async (
  requisicao,
  resposta
) => {
  const quadros = await listarQuadros(requisicao.idUsuario);
  resposta.status(200).json({ boards: quadros });
};

export const controladorCriarQuadro: RequestHandler = async (
  requisicao,
  resposta
) => {
  const quadro = await criarQuadro(
    requisicao.idUsuario,
    esquemaCriarQuadro.parse(requisicao.body)
  );
  resposta.status(201).json({ board: quadro });
};

export const controladorBuscarQuadro: RequestHandler = async (requisicao, resposta) => {
  const { id } = esquemaParametrosIdQuadro.parse(requisicao.params);
  const quadro = await buscarQuadro(requisicao.idUsuario, id);
  resposta.status(200).json({ board: quadro });
};

export const controladorAtualizarQuadro: RequestHandler = async (
  requisicao,
  resposta
) => {
  const { id } = esquemaParametrosIdQuadro.parse(requisicao.params);
  const quadro = await atualizarQuadro(
    requisicao.idUsuario,
    id,
    esquemaAtualizarQuadro.parse(requisicao.body)
  );
  emitirEventoDoQuadro(quadro.id, "board:changed", { board: quadro });
  resposta.status(200).json({ board: quadro });
};

export const controladorExcluirQuadro: RequestHandler = async (
  requisicao,
  resposta
) => {
  const { id } = esquemaParametrosIdQuadro.parse(requisicao.params);
  await excluirQuadro(requisicao.idUsuario, id);
  emitirEventoDoQuadro(id, "board:deleted", { boardId: id });
  resposta.status(204).send();
};
