import type { RequestHandler } from "express";
import { emitirEventoDoQuadro } from "../../tempo-real/index.js";
import {
  esquemaAnexo,
  esquemaComentario,
  esquemaIdAnexo,
  esquemaIdCartaoInteracao
} from "./interacoes.esquema.js";
import { criarAnexo, criarComentario, excluirAnexo } from "./interacoes.servico.js";

export const controladorCriarComentario: RequestHandler = async (req, res) => {
  const { cardId } = esquemaIdCartaoInteracao.parse(req.params);
  const { message } = esquemaComentario.parse(req.body);
  const resultado = await criarComentario(req.idUsuario, cardId, message);
  emitirEventoDoQuadro(resultado.boardId, "activity:created", { activity: resultado.activity });
  res.status(201).json({ activity: resultado.activity });
};

export const controladorCriarAnexo: RequestHandler = async (req, res) => {
  const { cardId } = esquemaIdCartaoInteracao.parse(req.params);
  const resultado = await criarAnexo(req.idUsuario, cardId, esquemaAnexo.parse(req.body));
  emitirEventoDoQuadro(resultado.boardId, "attachment:created", { attachment: resultado.attachment });
  res.status(201).json({ attachment: resultado.attachment });
};

export const controladorExcluirAnexo: RequestHandler = async (req, res) => {
  const { id } = esquemaIdAnexo.parse(req.params);
  const boardId = await excluirAnexo(req.idUsuario, id);
  emitirEventoDoQuadro(boardId, "attachment:deleted", { attachmentId: id });
  res.status(204).send();
};
