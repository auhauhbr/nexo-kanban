import type { RequestHandler } from "express";

import { emitirEventoDoQuadro } from "../../tempo-real/index.js";
import {
  esquemaAtualizarItemChecklist,
  esquemaCriarChecklist,
  esquemaCriarItemChecklist,
  esquemaParametrosCartaoChecklist,
  esquemaParametrosChecklist,
  esquemaParametrosItemChecklist,
  esquemaParametrosItensChecklist
} from "./checklists.esquema.js";
import {
  atualizarItemChecklist,
  criarChecklist,
  criarItemChecklist,
  excluirChecklist,
  excluirItemChecklist
} from "./checklists.servico.js";

const emitir = (idQuadro: string, evento: string, dados: unknown) =>
  emitirEventoDoQuadro(idQuadro, evento, dados);

export const controladorCriarChecklist: RequestHandler = async (req, res) => {
  const { cardId } = esquemaParametrosCartaoChecklist.parse(req.params);
  const resultado = await criarChecklist(req.idUsuario, cardId, esquemaCriarChecklist.parse(req.body));
  emitir(resultado.boardId, "checklist:created", { checklist: resultado.checklist });
  res.status(201).json({ checklist: resultado.checklist });
};

export const controladorExcluirChecklist: RequestHandler = async (req, res) => {
  const { id } = esquemaParametrosChecklist.parse(req.params);
  const boardId = await excluirChecklist(req.idUsuario, id);
  emitir(boardId, "checklist:deleted", { checklistId: id });
  res.status(204).send();
};

export const controladorCriarItemChecklist: RequestHandler = async (req, res) => {
  const { checklistId } = esquemaParametrosItensChecklist.parse(req.params);
  const resultado = await criarItemChecklist(req.idUsuario, checklistId, esquemaCriarItemChecklist.parse(req.body));
  emitir(resultado.boardId, "checklist-item:created", { item: resultado.item });
  res.status(201).json({ item: resultado.item });
};

export const controladorAtualizarItemChecklist: RequestHandler = async (req, res) => {
  const { id } = esquemaParametrosItemChecklist.parse(req.params);
  const resultado = await atualizarItemChecklist(req.idUsuario, id, esquemaAtualizarItemChecklist.parse(req.body));
  emitir(resultado.boardId, "checklist-item:updated", { item: resultado.item });
  res.status(200).json({ item: resultado.item });
};

export const controladorExcluirItemChecklist: RequestHandler = async (req, res) => {
  const { id } = esquemaParametrosItemChecklist.parse(req.params);
  const boardId = await excluirItemChecklist(req.idUsuario, id);
  emitir(boardId, "checklist-item:deleted", { itemId: id });
  res.status(204).send();
};
