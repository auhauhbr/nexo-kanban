import { Router } from "express";

import { intermediarioDeAutenticacao } from "../../intermediarios/autenticacao.intermediario.js";
import {
  controladorAtualizarEtiqueta,
  controladorCriarEtiqueta,
  controladorDesvincularEtiqueta,
  controladorExcluirEtiqueta,
  controladorVincularEtiqueta
} from "./etiquetas.controlador.js";

export const rotasEtiquetas = Router();

rotasEtiquetas.post(
  "/boards/:boardId/labels",
  intermediarioDeAutenticacao,
  controladorCriarEtiqueta
);
rotasEtiquetas.patch(
  "/labels/:id",
  intermediarioDeAutenticacao,
  controladorAtualizarEtiqueta
);
rotasEtiquetas.delete(
  "/labels/:id",
  intermediarioDeAutenticacao,
  controladorExcluirEtiqueta
);
rotasEtiquetas.post(
  "/cards/:cardId/labels/:labelId",
  intermediarioDeAutenticacao,
  controladorVincularEtiqueta
);
rotasEtiquetas.delete(
  "/cards/:cardId/labels/:labelId",
  intermediarioDeAutenticacao,
  controladorDesvincularEtiqueta
);
