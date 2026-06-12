import { Router } from "express";
import { intermediarioDeAutenticacao } from "../../intermediarios/autenticacao.intermediario.js";
import {
  controladorCriarAnexo,
  controladorCriarComentario,
  controladorExcluirAnexo
} from "./interacoes.controlador.js";

export const rotasInteracoes = Router();
rotasInteracoes.post("/cards/:cardId/activities", intermediarioDeAutenticacao, controladorCriarComentario);
rotasInteracoes.post("/cards/:cardId/attachments", intermediarioDeAutenticacao, controladorCriarAnexo);
rotasInteracoes.delete("/attachments/:id", intermediarioDeAutenticacao, controladorExcluirAnexo);
