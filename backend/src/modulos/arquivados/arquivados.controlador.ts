import type { RequestHandler } from "express";

import { emitirEventoDoQuadro } from "../../tempo-real/index.js";
import {
  esquemaIdCartaoArquivado,
  esquemaIdListaArquivada,
  esquemaIdQuadroArquivados,
  esquemaRestaurarCartao
} from "./arquivados.esquema.js";
import {
  listarArquivados,
  restaurarCartao,
  restaurarLista
} from "./arquivados.servico.js";

export const controladorListarArquivados: RequestHandler = async (req, res) => {
  const { id } = esquemaIdQuadroArquivados.parse(req.params);
  const arquivados = await listarArquivados(req.idUsuario, id);
  res.status(200).json({ archived: arquivados });
};

export const controladorRestaurarLista: RequestHandler = async (req, res) => {
  const { id } = esquemaIdListaArquivada.parse(req.params);
  const lista = await restaurarLista(req.idUsuario, id);
  emitirEventoDoQuadro(lista.boardId, "list:restored", { list: lista });
  res.status(200).json({ list: lista });
};

export const controladorRestaurarCartao: RequestHandler = async (req, res) => {
  const { id } = esquemaIdCartaoArquivado.parse(req.params);
  const { listId } = esquemaRestaurarCartao.parse(req.body);
  const { card, boardId } = await restaurarCartao(req.idUsuario, id, listId);
  emitirEventoDoQuadro(boardId, "card:restored", { card });
  res.status(200).json({ card });
};
