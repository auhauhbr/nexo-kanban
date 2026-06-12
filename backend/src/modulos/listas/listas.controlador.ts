import type { RequestHandler } from "express";

import { emitirEventoDoQuadro } from "../../tempo-real/index.js";
import {
  esquemaParametrosIdQuadro,
  esquemaCriarLista,
  esquemaParametrosIdLista,
  esquemaAtualizarLista
} from "./listas.esquema.js";
import { criarLista, excluirLista, atualizarLista } from "./listas.servico.js";

export const controladorCriarLista: RequestHandler = async (
  requisicao,
  resposta
) => {
  const { boardId: idQuadro } = esquemaParametrosIdQuadro.parse(requisicao.params);
  const lista = await criarLista(
    requisicao.idUsuario,
    idQuadro,
    esquemaCriarLista.parse(requisicao.body)
  );
  emitirEventoDoQuadro(lista.boardId, "list:created", { list: lista });
  resposta.status(201).json({ list: lista });
};

export const controladorAtualizarLista: RequestHandler = async (
  requisicao,
  resposta
) => {
  const { id } = esquemaParametrosIdLista.parse(requisicao.params);
  const lista = await atualizarLista(
    requisicao.idUsuario,
    id,
    esquemaAtualizarLista.parse(requisicao.body)
  );
  emitirEventoDoQuadro(lista.boardId, "list:updated", { list: lista });
  resposta.status(200).json({ list: lista });
};

export const controladorExcluirLista: RequestHandler = async (
  requisicao,
  resposta
) => {
  const { id } = esquemaParametrosIdLista.parse(requisicao.params);
  const idQuadro = await excluirLista(requisicao.idUsuario, id);
  emitirEventoDoQuadro(idQuadro, "list:deleted", { listId: id });
  resposta.status(204).send();
};
