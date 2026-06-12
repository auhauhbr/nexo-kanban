import type { RequestHandler } from "express";

import { emitirEventoDoQuadro } from "../../tempo-real/index.js";
import {
  esquemaParametrosIdCartao,
  esquemaCriarCartao,
  esquemaParametrosIdLista,
  esquemaAtualizarCartao
} from "./cartoes.esquema.js";
import { criarCartao, excluirCartao, atualizarCartao } from "./cartoes.servico.js";

export const controladorCriarCartao: RequestHandler = async (
  requisicao,
  resposta
) => {
  const { listId: idLista } = esquemaParametrosIdLista.parse(requisicao.params);
  const { card: cartao, boardId: idQuadro } = await criarCartao(
    requisicao.idUsuario,
    idLista,
    esquemaCriarCartao.parse(requisicao.body)
  );
  emitirEventoDoQuadro(idQuadro, "card:created", { card: cartao });
  resposta.status(201).json({ card: cartao });
};

export const controladorAtualizarCartao: RequestHandler = async (
  requisicao,
  resposta
) => {
  const { id } = esquemaParametrosIdCartao.parse(requisicao.params);
  const { card: cartao, boardId: idQuadro } = await atualizarCartao(
    requisicao.idUsuario,
    id,
    esquemaAtualizarCartao.parse(requisicao.body)
  );
  emitirEventoDoQuadro(idQuadro, "card:updated", { card: cartao });
  if (
    cartao.dueDate &&
    cartao.dueDate.getTime() > Date.now() &&
    cartao.dueDate.getTime() - Date.now() <= 24 * 60 * 60 * 1000
  ) {
    emitirEventoDoQuadro(idQuadro, "card:due-soon", { card: cartao });
  }
  resposta.status(200).json({ card: cartao });
};

export const controladorExcluirCartao: RequestHandler = async (
  requisicao,
  resposta
) => {
  const { id } = esquemaParametrosIdCartao.parse(requisicao.params);
  const idQuadro = await excluirCartao(requisicao.idUsuario, id);
  emitirEventoDoQuadro(idQuadro, "card:deleted", { cardId: id });
  resposta.status(204).send();
};
