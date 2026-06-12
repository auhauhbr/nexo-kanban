import type { RequestHandler } from "express";

import { emitirEventoDoQuadro } from "../../tempo-real/index.js";
import {
  esquemaAtualizarEtiqueta,
  esquemaCriarEtiqueta,
  esquemaParametrosCartaoEtiqueta,
  esquemaParametrosEtiqueta,
  esquemaParametrosQuadroEtiqueta
} from "./etiquetas.esquema.js";
import {
  atualizarEtiqueta,
  criarEtiqueta,
  excluirEtiqueta,
  vincularEtiqueta
} from "./etiquetas.servico.js";

export const controladorCriarEtiqueta: RequestHandler = async (requisicao, resposta) => {
  const { boardId } = esquemaParametrosQuadroEtiqueta.parse(requisicao.params);
  const resultado = await criarEtiqueta(
    requisicao.idUsuario,
    boardId,
    esquemaCriarEtiqueta.parse(requisicao.body)
  );
  emitirEventoDoQuadro(resultado.boardId, "label:created", { label: resultado.label });
  resposta.status(201).json({ label: resultado.label });
};

export const controladorAtualizarEtiqueta: RequestHandler = async (requisicao, resposta) => {
  const { id } = esquemaParametrosEtiqueta.parse(requisicao.params);
  const resultado = await atualizarEtiqueta(
    requisicao.idUsuario,
    id,
    esquemaAtualizarEtiqueta.parse(requisicao.body)
  );
  emitirEventoDoQuadro(resultado.boardId, "label:updated", { label: resultado.label });
  resposta.status(200).json({ label: resultado.label });
};

export const controladorExcluirEtiqueta: RequestHandler = async (requisicao, resposta) => {
  const { id } = esquemaParametrosEtiqueta.parse(requisicao.params);
  const idQuadro = await excluirEtiqueta(requisicao.idUsuario, id);
  emitirEventoDoQuadro(idQuadro, "label:deleted", { labelId: id });
  resposta.status(204).send();
};

export const controladorVincularEtiqueta: RequestHandler = async (requisicao, resposta) => {
  const { cardId, labelId } = esquemaParametrosCartaoEtiqueta.parse(requisicao.params);
  const idQuadro = await vincularEtiqueta(requisicao.idUsuario, cardId, labelId, true);
  emitirEventoDoQuadro(idQuadro, "card:labels-updated", { cardId });
  resposta.status(204).send();
};

export const controladorDesvincularEtiqueta: RequestHandler = async (requisicao, resposta) => {
  const { cardId, labelId } = esquemaParametrosCartaoEtiqueta.parse(requisicao.params);
  const idQuadro = await vincularEtiqueta(requisicao.idUsuario, cardId, labelId, false);
  emitirEventoDoQuadro(idQuadro, "card:labels-updated", { cardId });
  resposta.status(204).send();
};
